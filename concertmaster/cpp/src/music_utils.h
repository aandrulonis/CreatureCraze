#ifndef MUSIC_UTILS_H
#define MUSIC_UTILS_H

using namespace std;


static const int CLICKS_PER_BEAT = 24; // number of MIDI clocks in a tick
static const float MINUTES_TO_MICROSECONDS = 60 * 1e6;

enum MODE { MINOR, MAJOR };
enum INTERVAL { ZERO_INTERVAL, MINOR_SECOND, MAJOR_SECOND, MINOR_THIRD, MAJOR_THIRD, PERFECT_FOURTH, 
                TRITONE, PERFECT_FIFTH, MINOR_SIXTH, MAJOR_SIXTH, MINOR_SEVENTH, MAJOR_SEVENTH, AUGMENTED_SEVENTH };
enum PITCH { C, C_SHARP, D, D_SHARP, E, F, F_SHARP, G, G_SHARP, A, A_SHARP, B };
enum DYNAMICS { SILENT = 0, PIANO=32, MEZZO_FORTE=64, FORTE=96 };

struct Note {
    PITCH pitch;
    int octave;
    DYNAMICS dynamics;
    double num_beats;
    int value;
    static inline Note get_random(int &seed);
};

static const INTERVAL MAJOR_SCALE_INTERVALS[] = { MAJOR_SECOND, MAJOR_SECOND, MINOR_SECOND, 
                                                  MAJOR_SECOND, MAJOR_SECOND, MAJOR_SECOND, MINOR_SECOND };
static const INTERVAL MINOR_SCALE_INTERVALS[] = { MAJOR_SECOND, MINOR_SECOND, MAJOR_SECOND, 
                                                  MAJOR_SECOND, MINOR_SECOND, MAJOR_SECOND, MAJOR_SECOND };

static inline int get_rand(int &seed, int multiplier = 17, int increment = 3, int modulus = 57);
static inline int sum_vec(vector<int> &vec);
vector<int>& operator/=(vector<int> &vec, int scalar);
static inline int get_scale_val(PITCH* scale, PITCH pitch);
static inline bool in_scale(PITCH* scale, PITCH note);
static inline PITCH* get_scale(PITCH key, MODE mode);

#endif