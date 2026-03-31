#include "ellipsoid.h"


Ellipsoid::Ellipsoid(double a, double b, double c, double surface_roughness, double alpha, const vec3 &diffuse_col, const vec3 &F0) : 
    Shape3D(surface_roughness, alpha, diffuse_col, F0), a(a), b(b), c(c) {
        double p = c > a ? 1.6 : log2(3);
        double a_p, b_p, c_p;
        a_p = pow(a, p);
        b_p = pow(b, p);
        c_p = pow(c, p);
        surface_area = 4*M_PI*pow((a_p*b_p+a_p*c_p+b_p*c_p)/3.,1./p); // approximation
}

void Ellipsoid::compute_num_vertices(int res) {
    int sqrt_num_vertices = sqrt(surface_area*res)+1;
    num_vertices = pow(sqrt_num_vertices, 2);
    num_triangles = num_vertices;
}

void Ellipsoid::triangulate(double *vertex_positions, double *normals, int *triangle_inds) {
    this -> normals = normals;
    this -> vertex_positions = vertex_positions;
    int sqrt_num_vertices = sqrt(num_vertices);
    double theta, phi, d_theta, d_phi;
    int ind;
    theta = phi = 0;
    d_theta = d_phi = 2*M_PI/sqrt_num_vertices;
    double a_sq = pow(a,2);
    double b_sq = pow(b,2);
    double c_sq = pow(c,2);
    int below_ind, right_ind;
    for (int i = 0; i < sqrt_num_vertices; i++) {
        below_ind = i < sqrt_num_vertices -1 ? i + 1 : 0;
        for (int j = 0; j < sqrt_num_vertices; j++) {
            ind = (i*sqrt_num_vertices+j)*3;
            right_ind = j < sqrt_num_vertices - 1 ? j + 1 : 0;
            vertex_positions[ind] = a*sin(theta)*cos(phi);
            vertex_positions[ind+1] = b*sin(theta)*sin(phi);
            vertex_positions[ind+2] = c*cos(theta);
            normals[ind] = vertex_positions[ind]*2/a_sq;
            normals[ind+1] = vertex_positions[ind+1]*2/b_sq;
            normals[ind+2] = vertex_positions[ind+2]*2/c_sq;
            phi += d_phi;
            triangle_inds[ind] = ind;
            triangle_inds[ind+1] = right_ind;
            triangle_inds[ind+2] = below_ind;
        }
        theta += d_theta;
    }
}