#ifndef SCENE_H
#define SCENE_H

#include <unordered_map>
#include "math-utils/vector.h"
#include "object.h"

class Scene {
    private:
        unordered_map<vector<vec3*>, Object3D*> objects;
        vec3 source_pos;
        vec3 source_color_inf;

        int *vertex_indices;
        double *vertex_positions;
        double *vertex_colors;
        double *normals;
        int num_vertices;
        int num_triangles;

    public:
        Scene(const vec3 &source_pos, const vec3 &source_color_inf);
        ~Scene();
        void triangulate(int res);
        void compute_colors(const vec3 &obs_pos);
        void add_object(vec3 &pos, vec3 &angle, Object3D &obj);
        
        inline uintptr_t get_vertex_indices() { return reinterpret_cast<uintptr_t>(vertex_indices); }
        inline uintptr_t get_vertex_positions() { return reinterpret_cast<uintptr_t>(vertex_positions); }
        inline uintptr_t get_vertex_colors() { return reinterpret_cast<uintptr_t>(vertex_colors); }
        inline int get_num_vertices() { return num_vertices; }
        inline int get_num_triangles() { return num_triangles; }

    
};


#endif