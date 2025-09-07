#include <iostream>
#include <fstream>
#include <sys/stat.h>
#include <vector>
#include <direct.h>
#include <cstdint>
#include <filesystem>
#include <music_utils.h>
#include <song_props.h>
#include <song.h>
#include <island.h>

using namespace std;

Song::Song(char* name, int name_length, vector<NoteStruct> notes, int tempo, int time_sig_num, int time_sign_denom_pow) {
    this -> name = name;
    this -> name_length = name_length;
    this -> notes = notes;
    this -> tempo = tempo;
    this -> time_sig_num = time_sig_num;
    this -> time_sig_denom_pow = time_sig_denom_pow;
}

Song::Song(vector<NoteStruct> notes) { 
    // Only used for breeding songs
    this -> notes = notes;
} 

Song::Song(Song &other, std::string name, TempoStruct tempoStruct, TimeSignatureStruct timeSignatureStruct,
           KeyStruct keyStruct, ModeStruct modeStruct) {
    Song song(other);
    other.name = name.data();
    other.name_length = name.size();
    other.tempo = tempoStruct.value;
    other.time_sig_num = timeSignatureStruct.numerator;
    other.time_sig_denom_pow = timeSignatureStruct.denominator_pow;
    other.key = keyStruct.value;
    other.mode = modeStruct.value;
}

Song::Song(Song &other) {
    this -> name = other.name;
    this -> name_length = other.name_length;
    this -> notes = std::vector<NoteStruct>();
    for (auto note : other.notes) (this -> notes).push_back(NoteStruct(note));
    this -> tempo = other.tempo;
    this -> time_sig_num = other.time_sig_num;
    this -> time_sig_denom_pow = other.time_sig_denom_pow;
}

Song::Song() {
    // Do nothing
}

Song::~Song() {
    
}

vector<NoteStruct> Song::get_notes() { return notes; }
PITCH Song::get_key() { return key; }
MODE Song::get_mode() { return mode; }

Song Song::breed(Song parent1, Song parent2, double mutation_probability, int &seed) {
    // For each song property (relative pitch, time sig., key sig., etc,
    // make it probably song1 or song2, possibly a mutation)
    Song *smaller_song, *larger_song;
    if (parent1.get_notes().size() > parent2.get_notes().size()) {
        smaller_song = new Song(parent2);
        larger_song = new Song(parent1);
    } else {
        smaller_song = new Song(parent1);
        larger_song = new Song(parent2);
    }
    // Remove random note sequence from larger song so notes are the same length in both
    int notes_size = smaller_song->get_notes().size();
    int remove_ind = get_rand(seed) % notes_size;
    vector<NoteStruct>::iterator iterator1 = larger_song->get_notes().begin();
    advance(iterator1, remove_ind);
    vector<NoteStruct>::iterator iterator2 = vector<NoteStruct>::iterator(iterator1);
    advance(iterator2,  larger_song->get_notes().size()-notes_size);
    larger_song->get_notes().erase(iterator1, iterator2);

    // Breed notes
    vector<NoteStruct> new_song_notes;
    vector<NoteStruct>::iterator smaller_iter = smaller_song->get_notes().begin();
    vector<NoteStruct>::iterator larger_iter = larger_song->get_notes().begin();
    float total_beats = 0;
    for (int i = 0; i < smaller_song->get_notes().size(); i++) {
        NoteStruct new_note = SongProp<NoteStruct>::breed_props(*smaller_iter++, *larger_iter++, mutation_probability, seed);
        new_song_notes.push_back(new_note);
        total_beats += new_note.num_beats;
    }

    while(total_beats < Island::NUM_BEATS) {
        NoteStruct new_note = NoteStruct::get_random(seed);
        new_song_notes.push_back(new_note);
        total_beats += new_note.num_beats;
    }

    while (total_beats > Island::NUM_BEATS) {
        total_beats -= new_song_notes.back().num_beats;
        new_song_notes.pop_back();
    }

    delete smaller_song, larger_song;

    return Song(new_song_notes);
}

bool Song::write_to_midi(char* file_name, char* subdir_name) {

    // TEST
    uint8_t song_length_bytes, track_length_bytes, delta_time = 50;

    
    // Make subdirectory if it doesn't exist
    // struct stat buf;
    // if (stat(subdir_name, &buf)) {
    //     if (mkdir(subdir_name)) {
    //         cout << "Failed to create subdirectory " << subdir_name << "; exiting" << endl;
    //         return false;
    //     }
    // }
            
        // Make file and write song to it
    char* file_name_suffix = string(".mid").data();
    int file_name_length = 0;
    // Default file_name
    if (*file_name == '\0') {
        file_name_length = this -> name_length + 5;
        file_name = new char[file_name_length]; // TODO : how to delete this
        char* ptr = this -> name;
        while (*(ptr++) != '\0') {
            *(file_name++) = *ptr;
        }
        ptr = file_name_suffix;
        while (*(ptr++) != '\0') {
            *(file_name++) = *ptr;
        }
        file_name -= (file_name_length + 1);
    }
    else {
        // ".midi" assumed to be suffix
        while (*(file_name++) != '\0') file_name_length ++;
        file_name -= (file_name_length + 1);
    }
    int subdir_length = 0;
    while (*(subdir_name++) != '\0') subdir_length ++;
    subdir_name -= (subdir_length + 1);
    int full_subdir_length = file_name_length + 1 + subdir_length;
    char *full_subdir_name = new char[full_subdir_length];
    while (*(subdir_name++) != '\0') *(full_subdir_name++) = *(subdir_name - 1);
    *(full_subdir_name++) = '/';
    while (*(file_name++) != '\0') *(full_subdir_name++) = *(file_name - 1);
    *full_subdir_name = '\0';
    const char* final_file_name = full_subdir_name - full_subdir_length;
    FILE* file_ptr = fopen(final_file_name, "wb");

    // Make header chunk
    fwrite("MThd", 1, 4, file_ptr);
    char *header_chars = new char[10];
    for (int i = 0; i < 10; i += 2) header_chars[i] = 0;
    header_chars[1] = header_chars[5] = 0;
    header_chars[3] = 6;
    header_chars[7] = 1;
    header_chars[9] = tempo;
    fwrite(header_chars, 1, 10, file_ptr);
    delete[] header_chars;

    // Make beginning of track chunk
    fwrite("MTrk", 1, 4, file_ptr);
    for (int i = 0; i < 3; i ++) fputc(0, file_ptr);
    fputc(8 + 7 + 5 + 10 + 8 * notes.size() + 4, file_ptr);

    // Set time signature
    fputc(0, file_ptr);
    fputc(0xFF, file_ptr);
    fputc(0x58, file_ptr);
    fputc(4, file_ptr);
    fputc(time_sig_num, file_ptr);
    fputc(time_sig_denom_pow, file_ptr);
    fputc(CLICKS_PER_BEAT, file_ptr);
    fputc(CLICKS_PER_BEAT / 4, file_ptr);

    // Set tempo
    fputc(0, file_ptr);
    fputc(0xFF, file_ptr);
    fputc(0x51, file_ptr);
    fputc(3, file_ptr);
    const int microsPerBeat =  1 / (this -> tempo / MINUTES_TO_MICROSECONDS);
    fputc(microsPerBeat >> 16, file_ptr);
    fputc(microsPerBeat >> 8, file_ptr);
    fputc(microsPerBeat, file_ptr);

    // Set to Channel 1
    fputc(0, file_ptr);
    fputc(0xFF, file_ptr);
    fputc(0x20, file_ptr);
    fputc(1, file_ptr);
    fputc(1, file_ptr);

    // Set instrument name
    fputc(0, file_ptr);
    fputc(0xFF, file_ptr);
    fputc(4, file_ptr);
    fputc(6, file_ptr);
    fwrite("Violin", 1, 6, file_ptr);
    cout<<"num notes: "<<notes.size()<<endl;
    // Add notes
    for (auto note : notes) {
        int note_int = 60 + (12 * note.octave + note.pitch);

        // NoteStruct on
        fputc(0, file_ptr);
        fputc(0x90, file_ptr);
        fputc(note_int, file_ptr);
        fputc(note.dynamics, file_ptr);

        // NoteStruct off
        fputc(note.num_beats * this -> tempo * 2, file_ptr);
        fputc(0x80, file_ptr);
        fputc(note_int, file_ptr);
        fputc(note.dynamics, file_ptr);
    }

    // End of track
    fputc(0, file_ptr);
    fputc(0xFF, file_ptr);
    fputc(0x2F, file_ptr);
    fputc(0, file_ptr);

    fclose(file_ptr);

    cout<<std::filesystem::file_size(final_file_name)<<endl;
    delete[] full_subdir_name;
    delete[] file_name;
    return true;
}