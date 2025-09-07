#ifndef ISLAND_H
#define ISLAND_H

#include <stdio.h>
#include <vector>
#include <music_utils.h>
#include <song.h>

using namespace std;

class Island {
    private:
        int seed;
        int population_size;
        Song* population;
        bool is_evolved;
        Song* best_song;
        double best_fit_score;
        static double get_fitness(Song song);
    public:
       const static int NUM_BEATS = 8;
       Island (int population_size);
       ~Island();
        Song get_best_song();
        Island* evolve(int max_generations, int conv_tolerance);
};

#endif