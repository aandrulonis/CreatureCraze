#include <island.h>

using namespace std;

int main() {
    Island island(10);
    island.evolve(10,5);
    std::string subdir_name = "audio";
    std::string file_name = "test.mid";
    island.get_best_song().write_to_midi(file_name.data(),subdir_name.data());
    return 0;
}