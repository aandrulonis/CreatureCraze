#include <stdio.h>
#include <vector>
#include <music_utils.h>
#include <song.h>
#include <island.h>
#include <song_props.h>

using namespace std;


double Island::get_fitness(Song song) {
    double stable_pitch_fitness = 50;
    double stable_rhythm_fitness = 50;
    double creative_fitness = 50;
    vector<NoteStruct> notes = song.get_notes();
    if (!notes.size()) return 0;
    PITCH key = song.get_key();
    MODE mode = song.get_mode();
    PITCH *scale = get_scale(key, mode);
    NoteStruct last_note = notes[0];
  //  if (!in_scale(scale, last_note.pitch)) return 0; // first note must be in the key signature
    // TODO : set this manually when creating song
    int note_ind = 1;
    while (note_ind < notes.size()) {
        NoteStruct note = notes[note_ind];
        int interval = abs(note.value - last_note.value);
        int key_interval = note.pitch - key;

        // Punishes leaps in pitch for pitch stability; max punishment is -10
        if (interval > PERFECT_FOURTH) stable_pitch_fitness -= abs(interval) * 10 / 47;

        // Rewards leaps in pitch after long notes for rhythm stability by 5
        if (abs(last_note.value - note.value) > PERFECT_FOURTH && last_note.num_beats >= 2) {
            stable_rhythm_fitness += 5;
        }

        // Rewards short pitch intervals after short notes for rhythm stability by 5
        if (abs(last_note.value - note.value) < MINOR_THIRD && last_note.num_beats < 1) {
            stable_rhythm_fitness += 5;
        }

        // Rewards notes which are three times shorter than their predecessors for rhythm
        // stability by 5
        if (last_note.num_beats == note.num_beats * 3) stable_rhythm_fitness += 5;

        // Punishes repeated notes for creativity by 10
        if (note.value == last_note.value) creative_fitness -= 10;

        // Punishes accidentals; max punishment is -6
        if (!in_scale(scale, last_note.pitch)) {
            if (key_interval == MINOR_THIRD || key_interval == MINOR_SIXTH) stable_pitch_fitness -= 2;
            else if (key_interval == TRITONE) stable_pitch_fitness -= 6;
            else if (key_interval == 1) stable_pitch_fitness -= 1;
            else stable_pitch_fitness -= 4;
        }

        // Three-note sequences
        if (note_ind + 1 < notes.size()) {
            NoteStruct next_note = notes.at(note_ind + 1);
            int last_scale_val, this_scale_val, next_scale_val;
            last_scale_val = get_scale_val(scale, last_note.pitch);
            if (last_scale_val > 0) {
                this_scale_val = get_scale_val(scale, note.pitch);
                if (this_scale_val > 0) {
                    next_scale_val = get_scale_val(scale, next_note.pitch);
                    if (next_scale_val > 0) {
                        if (last_scale_val + 1 == this_scale_val
                        && this_scale_val + 1 == next_scale_val) {
                            stable_pitch_fitness += 10; // reward scale by 10
                        } else if ((this_scale_val - last_scale_val == MAJOR_THIRD 
                                || this_scale_val - last_scale_val ==  MINOR_THIRD)
                                && this_scale_val - last_scale_val == PERFECT_FIFTH) {
                        stable_pitch_fitness += 10; // reward major or minor arpegio by 10
                        }
                    }
                }
            }
        }
        note_ind++;
    }
    delete[] scale;
    double score = stable_rhythm_fitness * stable_pitch_fitness * creative_fitness;
    return score;
}

Island::Island (int population_size) {
    this -> population_size =  4 * (population_size / 4); // ensure population size is divisble by 4
    this -> population = new Song[this -> population_size];
    this -> is_evolved = false;
    this -> best_song = nullptr;
    this -> best_fit_score = -1;
}
Island::~Island() {
    delete[] population;
}
Song Island::get_best_song() { return Song(*best_song); } // return a copy for protection

Island* Island::evolve(int max_generations, int conv_tolerance) {
    vector<int> fitness_vec;
    int total_fitness_score = 0;
    // Set initial song & note properties, completely randomly
    for (int i = 0; i < population_size; i++) {
        double curr_beat = 0;
        vector<NoteStruct> notes;
        while (curr_beat < Island::NUM_BEATS) {
            const NoteStruct note = NoteStruct::get_random(seed);
            curr_beat += note.num_beats;
            notes.push_back(note);
        }
        Song song = Song::get_random(seed, notes);
        population[i] = song;
        int score = get_fitness(song);
        fitness_vec.push_back(score);
        total_fitness_score += score;
    }
    fitness_vec /= total_fitness_score;

    int iter = -1;
    Song *new_population = new Song[population_size];
    while (++iter < max_generations) {
        // Randomly select parents based on population size & breed
        for (int i = 0; i < population_size / 4; i++) {
            Song *parents = new Song[2];
            for (int j = i; j < i + 2; j++) {
                double rand_score = (get_rand(seed) % total_fitness_score) / (double) total_fitness_score;
                double curr_fitness_score = 0;
                int ind = -1;
                // Parent selected via random select with fitness scores as weights
                while (++ind < fitness_vec.size()) {
                    curr_fitness_score += fitness_vec[ind];
                    if (curr_fitness_score > rand_score) break;
                }
                fitness_vec[ind-1] = 0; // cannot select one song as a parent twice
                parents[j-i] = population[ind-1];
                double sum = sum_vec(fitness_vec);
                if (sum) fitness_vec /= sum;
            }
            int start_ind = i * 4, count = 0;
            while (count < 4) new_population[start_ind+(count++)] = Song::breed(parents[0], parents[1], .2, seed);
            delete[] parents;
        }
    //    delete[] population;
        population = new_population;

        // Assess fitness and find best fitness
        int best_fit_ind = -1;
        double best_fit_score = 0;
        for (int i = 0; i < population_size; i++) {
            double score = get_fitness(population[i]);
            fitness_vec[i] = score;
            if (score > best_fit_score) {
                score = best_fit_score;
                best_fit_ind = i;
            } 
        }
        if (best_fit_score < conv_tolerance || iter == max_generations - 1) {
            this -> best_fit_score = best_fit_score;
            Song best_song_obj(population[best_fit_ind], "Optimized Song", 
                               TempoStruct::get_random(seed), TimeSignatureStruct::get_random(seed),
                               KeyStruct::get_random(seed), ModeStruct::get_random(seed));
            best_song = &best_song_obj;
            return this;
        }
        total_fitness_score = sum_vec(fitness_vec);
    }
    return this;
}