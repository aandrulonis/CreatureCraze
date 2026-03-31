#include "scene.h"


Scene::Scene(const vec3 &source_pos, const vec3 &source_color_inf) :
    source_pos(source_pos), source_color_inf(source_color_inf) {
        num_vertices = num_triangles = 0;
        unordered_map<vector<vec3*>, Object3D*> objects;
}

Scene::~Scene() {
    delete[] vertex_indices;
    delete[] vertex_positions;
    delete[] vertex_colors;
    delete[] normals;
}

void Scene::triangulate(int res) {
    for (auto o : objects) {
        o.second->compute_num_vertices(res);
        num_vertices += o.second->get_num_vertices();
        num_triangles += o.second->get_num_triangles();
    }
    vertex_indices = new int[num_triangles*3];
    vertex_positions = new double[num_vertices*3];
    vertex_colors = new double[num_vertices*4];
    normals = new double[num_vertices*3];
    int vert_ind, triangle_ind;
    vert_ind = triangle_ind = 0;
    for (auto o : objects) {
        o.second->triangulate(vertex_positions+vert_ind,normals+vert_ind, vertex_indices+triangle_ind);
        vert_ind+=o.second->get_num_vertices()*3;
        triangle_ind+=o.second->get_num_triangles()*3;
    }
}


void Scene::compute_colors(const vec3 &obs_pos) {
    int color_ind = 0;
    for (auto o : objects) {
        o.second->compute_colors(vertex_colors+color_ind, obs_pos-*o.first[0], source_pos-*o.first[0], source_color_inf, *o.first[1]);
        color_ind += o.second->get_num_vertices()*4;
    }
}

void Scene::add_object(vec3 &pos, vec3 &angle, Object3D &obj) {
    vector<vec3*> key = {&pos, &angle};
    objects.insert({key, &obj});
}