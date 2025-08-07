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
                       prop1.get_value() : prop2.get_value(); 
            }
        }
};

class NoteProp: SongProp<Note> {
    public:
        NoteProp(Note n) : SongProp<Note>(n) {}
        static NoteProp get_random(int &seed) { return NoteProp(Note::get_random(seed)); }
};

class TimeSigProp : SongProp<