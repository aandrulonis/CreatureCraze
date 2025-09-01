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
    private:
        int tempo; // beat per minute
        int time_sig_num;
        int time_sig_denom_pow; // e.g. 3 --> 2^3 = 8
        PITCH key; // value is number of sharps / flats; - indiciates flats; + indicates sharps
        MODE mode; // major or minor
        short num_bars;
        vector<Note> notes;
        char* name;
        int name_length;
    public:
        Song(char* name, int name_length, vector<Note> notes, int tempo, int time_sig_num, int time_sign_denom_pow);
        Song();
        ~Song();
        vector<Note> get_notes();
        PITCH get_key();
        MODE get_mode();
        static Song breed(Song parent1, Song parent2, double mutation_probability, int &seed);
        static inline Song get_random(int &seed, vector<Note> notes) {
            int tempo = (get_rand(seed) % 81) + 60; // [60, 140]
            int time_sig_num = (get_rand(seed) % 5) + 2; // [2, 6]
            int time_sig_denom_pow = (get_rand(seed) % 5) + 2; // [2, 6]
            return Song("", 1, notes, tempo, time_sig_num, time_sig_denom_pow);
        }
        bool write_to_midi(char* file_name, char* subdir_name);
};

#endif