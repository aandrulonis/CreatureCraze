#include <vector>
#include <music_utils.h>
#include <iostream>

using namespace std;

vector<int>& operator/=(vector<int> &vec, int scalar) {
    for (auto &val : vec) val /= scalar;
    return vec;
}
