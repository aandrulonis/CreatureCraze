#include <vector>
#include <music_utils.h>

using namespace std;

vector<int>& operator/=(vector<int> &vec, int scalar) {
    for (auto &val : vec) val /= scalar;
    return vec;
}
