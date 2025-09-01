#include <island.h>

using namespace std;

int main() {
    Island island(10);
    island.evolve(10,5);
    island.get_best_song()->write_to_midi(std::string("test.midi").data(),std::string("./audio_files").data());
    return 0;
}