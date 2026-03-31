#include "music_vector_encoder.h"
#include <cmath>
#include <algorithm>

MusicVectorEncoder::MusicVectorEncoder(int max_notes,
                                       int pitch_min,
                                       int pitch_max,
                                       double dur_min,
                                       double dur_max,
                                       int vel_min,
                                       int vel_max)
    : max_notes(max_notes),
      pitch_min(pitch_min),
      pitch_max(pitch_max),
      dur_min(dur_min),
      dur_max(dur_max),
      vel_min(vel_min),
      vel_max(vel_max) {
    
    vector_size = 1 + (max_notes * 3);
}

double MusicVectorEncoder::quantize_duration(double duration) const {
    static const double common_durations[] = {
        0.0625, 0.125, 0.25, 0.375, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0
    };
    static const int num_durations = sizeof(common_durations) / sizeof(double);
    
    double closest = common_durations[0];
    double min_diff = fabs(duration - closest);
    
    for (int i = 1; i < num_durations; i++) {
        double diff = fabs(duration - common_durations[i]);
        if (diff < min_diff) {
            min_diff = diff;
            closest = common_durations[i];
        }
    }
    
    return closest;
}

double MusicVectorEncoder::clip(double val) {
    return max(0.0, min(1.0, val));
}

vector<double> MusicVectorEncoder::phrase_to_vector(const vector<NoteStruct>& phrase) const {
    vector<double> vec(vector_size, 0.0);
    
    // Encode number of notes (normalized)
    int num_notes = min((int)phrase.size(), max_notes);
    vec[0] = (double)num_notes / max_notes;
    
    // Encode each note
    for (int i = 0; i < num_notes; i++) {
        int base_idx = 1 + (i * 3);
        
        // Get MIDI pitch value (octave * 12 + pitch)
        int midi_pitch = phrase[i].octave * 12 + phrase[i].pitch;
        
        // Normalize pitch to [0, 1]
        vec[base_idx] = (double)(midi_pitch - pitch_min) / (pitch_max - pitch_min);
        
        // Normalize duration (log scale for perceptual uniformity)
        double log_dur = log2(phrase[i].num_beats / dur_min) / 
                        log2(dur_max / dur_min);
        vec[base_idx + 1] = clip(log_dur);
        
        // Normalize velocity
        vec[base_idx + 2] = (double)(phrase[i].dynamics - vel_min) / (vel_max - vel_min);
    }
    
    // Clip all values to [0, 1]
    for (double& val : vec) {
        val = clip(val);
    }
    
    return vec;
}

vector<NoteStruct> MusicVectorEncoder::vector_to_phrase(const vector<double>& vec) const {
    // Decode number of notes
    int num_notes = max(1, (int)round(vec[0] * max_notes));
    
    vector<NoteStruct> phrase;
    phrase.reserve(num_notes);
    
    for (int i = 0; i < num_notes; i++) {
        int base_idx = 1 + (i * 3);
        
        // Denormalize pitch (round to nearest semitone)
        int midi_pitch = (int)round(vec[base_idx] * (pitch_max - pitch_min) + pitch_min);
        midi_pitch = max(pitch_min, min(pitch_max, midi_pitch));
        
        // Convert to octave and pitch
        int octave = midi_pitch / 12;
        PITCH pitch = (PITCH)(midi_pitch % 12);
        
        // Denormalize duration (from log scale)
        double log_dur = vec[base_idx + 1] * log2(dur_max / dur_min);
        double duration = dur_min * pow(2.0, log_dur);
        duration = quantize_duration(duration);
        
        // Denormalize velocity
        int velocity = (int)round(vec[base_idx + 2] * (vel_max - vel_min) + vel_min);
        velocity = max(vel_min, min(vel_max, velocity));
        
        // Quantize velocity to DYNAMICS enum values
        DYNAMICS dynamics;
        if (velocity < 32) dynamics = SILENT;
        else if (velocity < 64) dynamics = PIANO;
        else if (velocity < 96) dynamics = MEZZO_FORTE;
        else dynamics = FORTE;
        
        phrase.push_back({pitch, octave, dynamics, duration});
    }
    
    return phrase;
}

vector<double> MusicVectorEncoder::mutate(const vector<double>& vec, 
                                          double mutation_rate,
                                          double mutation_strength,
                                          int& seed) const {
    vector<double> mutated = vec;
    
    for (size_t i = 0; i < mutated.size(); i++) {
        double rand_prob = (get_rand(seed) % 100) / 100.0;
        
        if (rand_prob < mutation_rate) {
            // Box-Muller transform for Gaussian noise
            double u1 = (get_rand(seed) % 10000) / 10000.0;
            double u2 = (get_rand(seed) % 10000) / 10000.0;
            double gaussian = sqrt(-2.0 * log(u1)) * cos(2.0 * PI * u2);
            
            mutated[i] += gaussian * mutation_strength;
            mutated[i] = clip(mutated[i]);
        }
    }
    
    return mutated;
}

pair<vector<double>, vector<double>> MusicVectorEncoder::crossover_uniform(
        const vector<double>& parent1,
        const vector<double>& parent2,
        int& seed) const {
    
    vector<double> child1(parent1.size());
    vector<double> child2(parent2.size());
    
    for (size_t i = 0; i < parent1.size(); i++) {
        if (get_rand(seed) % 2 == 0) {
            child1[i] = parent1[i];
            child2[i] = parent2[i];
        } else {
            child1[i] = parent2[i];
            child2[i] = parent1[i];
        }
    }
    
    return {child1, child2};
}

pair<vector<double>, vector<double>> MusicVectorEncoder::crossover_single_point(
        const vector<double>& parent1,
        const vector<double>& parent2,
        int& seed) const {
    
    int point = get_rand(seed) % (parent1.size() - 1) + 1;
    
    vector<double> child1(parent1.size());
    vector<double> child2(parent2.size());
    
    for (int i = 0; i < point; i++) {
        child1[i] = parent1[i];
        child2[i] = parent2[i];
    }
    
    for (size_t i = point; i < parent1.size(); i++) {
        child1[i] = parent2[i];
        child2[i] = parent1[i];
    }
    
    return {child1, child2};
}

pair<vector<double>, vector<double>> MusicVectorEncoder::crossover_blend(
        const vector<double>& parent1,
        const vector<double>& parent2,
        int& seed) const {
    
    vector<double> child1(parent1.size());
    vector<double> child2(parent2.size());
    
    for (size_t i = 0; i < parent1.size(); i++) {
        double alpha = (get_rand(seed) % 100) / 100.0;
        child1[i] = alpha * parent1[i] + (1.0 - alpha) * parent2[i];
        child2[i] = alpha * parent2[i] + (1.0 - alpha) * parent1[i];
    }
    
    return {child1, child2};
}