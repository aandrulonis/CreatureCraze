#ifndef ELLIPSOID_H
#define ELLIPSOID_H

#include "shape3d.h"
#include "math-utils/vector.h"

class Ellipsoid : public Shape3D {

    private:
        double a, b, c;
        double surface_area;

    public:
        Ellipsoid(double a, double b, double c, double surface_roughness, double alpha, const vec3 &diffuse_col, const vec3 &F0);
        void compute_num_vertices(int res);
        void triangulate(double *vertex_positions, double *normals, int *triangle_inds);

};

#endif