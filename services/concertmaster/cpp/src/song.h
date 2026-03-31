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
#include <song_props.h>

using namespace std;

class Song {
    private:
        int tempo; // beat per minute
        int time_sig_num;
        int time_sig_denom_pow; // e.g. 3 --> 2^3 = 8
        PITCH key; // value is number of sharps / flats; - indiciates flats; + indicates sharps
        MODE mode; // major or minor
        short num_bars;
        std::vector<NoteStruct> notes;
        char* name;
        int name_length;
    public:
        Song(char* name, int name_length, std::vector<NoteStruct> notes, int tempo, int time_sig_num, int time_sign_denom_pow);
        Song(std::vector<NoteStruct> notes);
        Song(Song &other, std::string name, 
             TempoStruct tempoStruct, TimeSignatureStruct timeSignatureStruct,
             KeyStruct keyStruct, ModeStruct modeStruct);
        Song(Song &other); // copy constructor
        Song();
        ~Song();
        vector<NoteStruct> get_notes();
        PITCH get_key();
        MODE get_mode();
        static Song breed(Song parent1, Song parent2, double mutation_probability, int &seed);
        static inline Song get_random(int &seed, vector<NoteStruct> notes) {
            int tempo = (get_rand(seed) % 81) + 60; // [60, 140]
            int time_sig_num = (get_rand(seed) % 5) + 2; // [2, 6]
            int time_sig_denom_pow = (get_rand(seed) % 5) + 2; // [2, 6]
            return Song("", 1, notes, tempo, time_sig_num, time_sig_denom_pow);
        }
        bool write_to_midi(char* file_name, char* subdir_name);
};

#endif