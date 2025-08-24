#ifndef SONG_PROPS_H
#define SONG_PROPS_H

#include <music_utils.h>

using namespace std;

template <typename T> class SongProp {
    public:
        SongProp (T val);
        static T breed_props(T prop1, T prop2, double mutation_probability, int &seed);
};

class NoteProp: SongProp<Note> {
    public:
        NoteProp(Note n);
        static NoteProp get_random(int &seed);
};

#endif