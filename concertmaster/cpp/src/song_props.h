#ifndef SONG_PROPS_H
#define SONG_PROPS_H

#include <music_utils.h>

using namespace std;

template <typename T> class SongProp {
    public:
        T value;
        T get_value() { return value; }
        SongProp (T val) : value(val) {}
        static T breed_props(T prop1, T prop2, double mutation_probability, int &seed) {
            double rand = (get_rand(seed) % 100) / 100.0;
            if (rand < mutation_probability) {
                return T::get_random(seed);
            } else {
                return rand < mutation_probability + (1-mutation_probability) / 2 ? 
                       prop1 : prop2; 
            }
        }
        static T get_random(int &seed) { return SongProp<T>(T::get_random()); }
};

struct NoteStruct {
    PITCH pitch;
    int octave;
    DYNAMICS dynamics;
    double num_beats;
    int value = octave * 12 + pitch;
    NoteStruct get_value();
    static inline NoteStruct get_random(int &seed) {
        PITCH pitch = (PITCH) (get_rand(seed) % 12); // [0, 11]
        int octave = (get_rand(seed) % 4) - 2; // [-2, 1]
        DYNAMICS dynamics = (DYNAMICS) ((get_rand(seed) % 4) * 32); // {0, 32, 64, 96}
        double num_beats = (get_rand(seed) % 64) * 0.0625; // {0, 1/16, 1/8, ..., 4}
        return { pitch, octave, dynamics, num_beats };
    };
};

struct TempoStruct {
    int value; // beats per minute
    static inline TempoStruct get_random(int &seed) { return { 80 + get_rand(seed) % 40 }; }
};

struct TimeSignatureStruct {
    int numerator;
    int denominator_pow; // e.g. 3 --> 2^3 = 8
    static inline TimeSignatureStruct get_random(int &seed) {
        int num = get_rand(seed) % 5 + 1;
        int denom_power = get_rand(seed) % 4 + 1;
        return { num, denom_power };
    }
};

struct KeyStruct {
    PITCH value;
    static inline KeyStruct get_random(int &seed) { return { (PITCH) (get_rand(seed) % 12) }; }
};

struct ModeStruct {
    MODE value;
    static inline ModeStruct get_random(int &seed) { return { (MODE) (get_rand(seed) % 2) }; }
};

#endif