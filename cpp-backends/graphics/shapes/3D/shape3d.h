#ifndef SHAPE_3D_H
#define SHAPE_3D_H

#include "math-utils/vector.h"
#include "math-utils/matrix.h"
#include <gsl/gsl_math.h>

using namespace std;

class Shape3D {
    private:
        double surface_roughness; // 0 to infinity
        double alpha; // 0 - 1, translucency
        vec3 diffuse_col;
        vec3 F0; // characteristic specular reflectance of material

    protected:
        int num_vertices;
        int num_triangles;
        double *normals, *vertex_positions;

        void compute_color(double *color, const vec3 &n, const vec3 &p, const vec3 &obs_pos, const vec3 &source_pos, const vec3 &source_color_inf);
        vec3 compute_BRDF(const vec3 &l, const vec3 &n, const vec3 &h, const vec3 &v);
        vec3 Fresnel(const vec3 &l, const vec3 &h);
        double NDF(double h_dot_n);
        double geometry(const vec3 &l, const vec3 &v, const vec3 &h, const vec3 &n);

    public: 
        Shape3D(double surface_roughness, double alpha, const vec3 &diffuse_col, const vec3 &F0);
        virtual void compute_num_vertices(int res) = 0;
        virtual void triangulate(double *vertex_positions, double *normals, int *triangle_inds) = 0;
        inline int get_num_vertices() { return num_vertices; }
        inline int get_num_triangles() { return num_triangles; }
        void compute_colors(double *vert_cols, const vec3 &obs_pos, const vec3 &source_pos, const vec3 &source_color_inf, const vec3 &rot_angle);


};


#endif