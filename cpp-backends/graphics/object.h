#ifndef OBJECT_H
#define OBJECT_H

#include "shapes/3D/shape3d.h"
#include "math-utils/matrix.h"
#include "math-utils/vector.h"
#include <unordered_map>

using namespace std;

class Object3D {
    private:
        unordered_map<vector<vec3*>, Shape3D*> shapes;
        int num_vertices, num_triangles;

    public:
        Object3D();
        void compute_num_vertices(int res);
        void triangulate(double *vertex_pos, double *vertex_norm, int *triangle_ind);
        void compute_colors(double *vertex_col, const vec3 &obs_pos, const vec3 &source_pos, const vec3 &source_color_inf, const vec3 &rot_angle);
        void add_shape(vec3 &pos, vec3 &angle, Shape3D &shape);

        inline int get_num_vertices() { return num_vertices; }
        inline int get_num_triangles() { return num_triangles; }

};

#endif