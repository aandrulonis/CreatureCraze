#ifndef ISLAND_H
#define ISLAND_H

#include <stdio.h>
#include <vector>
#include <music_utils.h>
#include <song.h>

using namespace std;

class Island {
    private:
        static double get_fitness(Song song);
    public:
        Island (int population_size);
        ~Island();
        Song* get_best_song();
        Island* evolve(int max_generations, int conv_tolerance);
};

#endif