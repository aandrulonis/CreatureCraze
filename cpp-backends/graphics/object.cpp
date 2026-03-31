#include "object.h"

Object3D::Object3D() { 
    unordered_map<vector<vec3*>, Shape3D*> shapes;
    num_vertices = num_triangles = 0; 
}


void Object3D::compute_num_vertices(int res) {
    for (auto s : shapes) {
        s.second->compute_num_vertices(res);
        num_vertices += s.second->get_num_vertices();
        num_triangles += s.second->get_num_triangles();
    }
}

void Object3D::triangulate(double *vertex_pos, double *vertex_norm, int *triangle_ind) {
    int vertex_ind, triangle_i;
    vertex_ind = triangle_i = 0;
    for (auto s : shapes) {
        s.second->triangulate(vertex_pos + vertex_ind, vertex_norm + vertex_ind, triangle_i + triangle_ind);
        vertex_ind += s.second->get_num_vertices()*3;
        triangle_i += s.second->get_num_triangles()*3;
    }
}

void Object3D::compute_colors(double *vertex_col, const vec3 &obs_pos, const vec3 &source_pos, const vec3 &source_color_inf, const vec3 &rot_angle) {
    int vertex_ind = 0;
    for (auto s : shapes) {
        s.second->compute_colors(vertex_col+vertex_ind,obs_pos-*s.first[0], source_pos-*s.first[0], source_color_inf, rot_angle+*s.first[1]);
        vertex_ind += s.second->get_num_vertices()*4;
    }
}

void Object3D::add_shape(vec3 &pos, vec3 &angle, Shape3D &shape) {
    vector<vec3*> key = {&pos, &angle};
    shapes.insert({key, &shape});
}