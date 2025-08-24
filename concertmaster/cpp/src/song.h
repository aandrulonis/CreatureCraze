#ifndef SONG_H
#define SONG_H

#include <iostream>
#include <fstream>
#include <sys/stat.h>
#include <vector>
#include <direct.h>
#include <cstdint>
#include <filesystem>
#include <music_utils.h>

using namespace std;

class Song {
    public:
        Song(char* name, int name_length, vector<Note> notes, int tempo, int time_sig_num, int time_sign_denom_pow);
        Song();
        ~Song();
        vector<Note> get_notes();
        PITCH get_key();
        MODE get_mode();
        static Song breed(Song parent1, Song parent2, int &seed);
        static inline Song get_random(int &seed, vector<Note> notes);
        bool write_to_midi(char* file_name, char* subdir_name);
};

#endif