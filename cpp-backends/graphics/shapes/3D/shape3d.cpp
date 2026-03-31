#include "shape3d.h"

using namespace std;

Shape3D::Shape3D(double surface_roughness, double alpha, const vec3 &diffuse_col, const vec3 &F0) :
    surface_roughness(surface_roughness), alpha(alpha), diffuse_col(diffuse_col), F0(F0) {
        num_vertices = num_triangles = 0;
}

void Shape3D::compute_colors(double *vert_cols, const vec3 &obs_pos, const vec3 &source_pos, const vec3 &source_color_inf, const vec3 &rot_angle) {
    const matrix33 R1 = matrix33(
        1, 0, 0,
        0, cos(rot_angle.x()), -sin(rot_angle.x()),
        0, sin(rot_angle.x()), cos(rot_angle.x())
    );
    const matrix33 R2 = matrix33(
        cos(rot_angle.y()), 0, sin(rot_angle.y()),
        0, 1, 0,
        -sin(rot_angle.y()), 0, cos(rot_angle.y())
    );
    const matrix33 R3 = matrix33(
        cos(rot_angle.z()), -sin(rot_angle.z()), 0,
        sin(rot_angle.z()), cos(rot_angle.z()), 0,
        0, 0, 1
    );
    for (int i = 0; i < num_vertices; i++) {
        vec3 n = R3.apply(R2.apply(R1.apply(vec3(normals[i*3], normals[i*3+1], normals[i*3+2]))));
        vec3 p = R3.apply(R2.apply(R1.apply(vec3(vertex_positions[i*3],vertex_positions[i*3+1],vertex_positions[i*3+2]))));
        compute_color(vert_cols+i*4, n, p, obs_pos, source_pos, source_color_inf);
    }
}

void Shape3D::compute_color(double *color, const vec3 &n, const vec3 &p, const vec3 &obs_pos, const vec3 &source_pos, const vec3 &source_color_inf) {
    const vec3 l = (source_pos - p).scale(-1).unit_vec();
    vec3 v = (obs_pos - p).scale(-1).unit_vec();
    vec3 h = (l+v).scale(1/(l-v).norm());
    vec3 color_vec = compute_BRDF(l, n, h, v).scale(M_PI)* source_color_inf.copy().scale(1./(fabs(n.dot(p-source_pos))));
    color[0] = min(1., color_vec.x());
    color[1] = min(1., color_vec.y());
    color[2] = min(1., color_vec.z());
    color[3] = alpha;
}

vec3 Shape3D::compute_BRDF(const vec3 &l, const vec3 &n, const vec3 &h, const vec3 &v) {
    vec3 spec = Fresnel(l, h).scale(geometry(l, v, h, n)*NDF(h.dot(n))/(4*n.dot(l)*n.dot(v))); // specular term
    vec3 diffuse = diffuse_col.scale(1/M_PI); // Lambertian model
    return spec + diffuse;
}

vec3 Shape3D::Fresnel(const vec3 &l, const vec3 &h) {
    // Schlick approximation
    return F0+(vec3(1)-F0).scale(pow(1-l.dot(h),5));
}

double Shape3D::NDF(double h_dot_n) {
    // Trowbridge and Reitz approximation
    const double num = pow(surface_roughness, 2);
    const double denom = M_PI*pow(pow(h_dot_n,2)*(num-1)+1,2);
    return num / denom;
}

double Shape3D::geometry(const vec3 &l, const vec3 &v, const vec3 &h, const vec3 &n) {
    // Kelemen et al. approximation for Cook-Torrance
    return n.dot(l)*n.dot(v) / pow(l.dot(h), 2);
}