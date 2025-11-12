// music_vector_encoder.h
#ifndef MUSIC_VECTOR_ENCODER_H
#define MUSIC_VECTOR_ENCODER_H

#include <vector>
#include <utility>
#include <music_utils.h>
#include <song_props.h>

using namespace std;

/**
 * Vector-based encoding for musical phrases optimized for genetic algorithms.
 * Each parameter is normalized to [0, 1] for smooth mutations and crossover.
 */
class MusicVectorEncoder {
private:
    int max_notes;
    int pitch_min;      // MIDI note minimum (e.g., 36 = C2)
    int pitch_max;      // MIDI note maximum (e.g., 96 = C7)
    double dur_min;     // Minimum duration in beats
    double dur_max;     // Maximum duration in beats
    int vel_min;        // Minimum velocity
    int vel_max;        // Maximum velocity
    
    /**
     * Quantize duration to musically sensible values
     */
    double quantize_duration(double duration) const;
    
    /**
     * Clip value to [0, 1] range
     */
    static inline double clip(double val);

public:
    // Vector structure: [num_notes, note1_pitch, note1_dur, note1_vel, note2_pitch, ...]
    int vector_size; // 1 + (max_notes * 3)
    
    /**
     * Constructor
     * @param max_notes Maximum number of notes in a phrase
     * @param pitch_min MIDI pitch minimum
     * @param pitch_max MIDI pitch maximum
     * @param dur_min Duration minimum in beats
     * @param dur_max Duration maximum in beats
     * @param vel_min MIDI velocity minimum
     * @param vel_max MIDI velocity maximum
     */
    MusicVectorEncoder(int max_notes = 16,
                       int pitch_min = 36,
                       int pitch_max = 96,
                       double dur_min = 0.0625,
                       double dur_max = 4.0,
                       int vel_min = 40,
                       int vel_max = 120);
    
    /**
     * Convert a musical phrase to a normalized vector [0, 1]^n
     * @param phrase Vector of NoteStruct
     * @return Normalized vector in [0, 1]
     */
    vector<double> phrase_to_vector(const vector<NoteStruct>& phrase) const;
    
    /**
     * Convert a normalized vector back to a musical phrase
     * @param vec Normalized vector in [0, 1]
     * @return Vector of NoteStruct
     */
    vector<NoteStruct> vector_to_phrase(const vector<double>& vec) const;
    
    /**
     * Apply Gaussian mutation to vector
     * @param vec Input vector
     * @param mutation_rate Probability of mutating each gene
     * @param mutation_strength Standard deviation of Gaussian noise
     * @param seed Random seed
     * @return Mutated vector
     */
    vector<double> mutate(const vector<double>& vec, 
                         double mutation_rate,
                         double mutation_strength,
                         int& seed) const;
    
    /**
     * Perform uniform crossover between two parent vectors
     * @param parent1 First parent vector
     * @param parent2 Second parent vector
     * @param seed Random seed
     * @return Pair of offspring vectors
     */
    pair<vector<double>, vector<double>> crossover_uniform(
            const vector<double>& parent1,
            const vector<double>& parent2,
            int& seed) const;
    
    /**
     * Perform single-point crossover between two parent vectors
     * @param parent1 First parent vector
     * @param parent2 Second parent vector
     * @param seed Random seed
     * @return Pair of offspring vectors
     */
    pair<vector<double>, vector<double>> crossover_single_point(
            const vector<double>& parent1,
            const vector<double>& parent2,
            int& seed) const;
    
    /**
     * Perform blend crossover (arithmetic crossover) between two parent vectors
     * @param parent1 First parent vector
     * @param parent2 Second parent vector
     * @param seed Random seed
     * @return Pair of offspring vectors
     */
    pair<vector<double>, vector<double>> crossover_blend(
            const vector<double>& parent1,
            const vector<double>& parent2,
            int& seed) const;
};

#endif // MUSIC_VECTOR_ENCODER_H