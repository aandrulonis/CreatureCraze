#ifndef MUSIC_UTILS_H
#define MUSIC_UTILS_H
#include <vector>
#include <iostream>

using namespace std;

static const int CLICKS_PER_BEAT = 24; // number of MIDI clocks in a tick
static const float MINUTES_TO_MICROSECONDS = 60 * 1e6;

enum MODE { MINOR, MAJOR };
enum INTERVAL { ZERO_INTERVAL, MINOR_SECOND, MAJOR_SECOND, MINOR_THIRD, MAJOR_THIRD, PERFECT_FOURTH, 
                TRITONE, PERFECT_FIFTH, MINOR_SIXTH, MAJOR_SIXTH, MINOR_SEVENTH, MAJOR_SEVENTH, AUGMENTED_SEVENTH };
enum PITCH { C, C_SHARP, D, D_SHARP, E, F, F_SHARP, G, G_SHARP, A, A_SHARP, B };
enum DYNAMICS { SILENT = 0, PIANO=32, MEZZO_FORTE=64, FORTE=96 };


static const INTERVAL MAJOR_SCALE_INTERVALS[] = { MAJOR_SECOND, MAJOR_SECOND, MINOR_SECOND, 
                                                  MAJOR_SECOND, MAJOR_SECOND, MAJOR_SECOND, MINOR_SECOND };
static const INTERVAL MINOR_SCALE_INTERVALS[] = { MAJOR_SECOND, MINOR_SECOND, MAJOR_SECOND, 
                                                  MAJOR_SECOND, MINOR_SECOND, MAJOR_SECOND, MAJOR_SECOND };



static inline PITCH* get_scale(PITCH key, MODE mode) {
    const INTERVAL *intervals = mode == MAJOR ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
    PITCH *scale = new PITCH[7];
    int val = key;
    for (int i = 0; i < 7; i++) {
        *(scale++) = (PITCH) ((val += intervals[i]) % 12);
    } 
    return scale - 7;
}

static inline bool in_scale(PITCH* scale, PITCH note) {
    for (int i = 0; i < 7; i++) if (scale[i] == note) return true;
    return false;
}

static inline int get_scale_val(PITCH* scale, PITCH pitch) {
    for (int i = 0; i < 7; i++) if (scale[i] == pitch) return i;
    return -1;
}

// Linear Congruential Generator
static inline int get_rand(int &seed, int multiplier = 17, int increment = 3, int modulus = 57) {
    seed = (multiplier * seed + increment) % modulus;
    return abs(seed);
}

static inline int sum_vec(vector<int> &vec) {
    int sum = 0;
    for (auto val : vec) sum += val;
    return sum;
}

vector<int>& operator/=(vector<int> &vec, int scalar);

#endif