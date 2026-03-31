#ifndef VECTOR_H
#define VECTOR_H


#include <gsl/gsl_vector.h>
#include <gsl/gsl_math.h>
#include <vector>

struct vec3 {
    gsl_vector *vec;

    vec3(double x, double y, double z) {
        vec = gsl_vector_alloc(3);
        gsl_vector_set(vec, (size_t) 0, x);
        gsl_vector_set(vec, (size_t) 1, y);
        gsl_vector_set(vec, (size_t) 2, z);
    }
    vec3(double v) {
        vec = gsl_vector_alloc(3);
        gsl_vector_set_all(vec, v);
    }
    vec3() { 
        vec = gsl_vector_alloc(3);
        gsl_vector_set_all(vec, 0.);
     }
    vec3(const vec3& other) {
        vec = gsl_vector_alloc(3);
        gsl_vector_set(vec, (size_t) 0, other.x());
        gsl_vector_set(vec, (size_t) 1, other.y());
        gsl_vector_set(vec, (size_t) 2, other.z());
    }
    ~vec3() { gsl_vector_free(vec); }

    vec3 copy() const { return vec3(x(),y(),z()); }

    double x() const { return gsl_vector_get(vec, (size_t) 0); }
    double y() const { return gsl_vector_get(vec, (size_t) 1); }
    double z() const { return gsl_vector_get(vec, (size_t) 2); }
    void setX(double x) { gsl_vector_set(vec, (size_t) 0, x); }
    void setY(double y) { gsl_vector_set(vec, (size_t) 1, y); }
    void setZ(double z) { gsl_vector_set(vec, (size_t) 2, z); }

    double dot(const vec3& other) const { return x()*other.x()+y()*other.y()+z()*other.z(); }
    vec3 cross(const vec3& other) const { 
        return vec3(y()*other.z()-z()*other.y(),
        -(x()*other.z()-z()*other.x()),
        y()*other.z()-z()*other.y()); 
    }
    vec3& scale(double c) { 
        gsl_vector_scale(vec, c); 
        return *this; }
    double norm() const { return sqrt(pow(x(),2)+pow(y(),2)+pow(z(),2)); }
    vec3 unit_vec() const { vec3 u=copy();u.scale(1/norm()); return u; }

    vec3 operator+(const vec3& other) const { return vec3(x()+other.x(),y()+other.y(),z()+other.z()); }
    vec3 operator-(const vec3& other) const { return vec3(x()-other.x(),y()-other.y(),z()-other.z()); }
    vec3 operator/(const vec3& other) const { return vec3(x()/other.x(),y()/other.y(),z()/other.z()); }
    vec3 operator*(const vec3& other) const { return vec3(x()*other.x(),y()*other.y(),z()*other.z()); }
    vec3& operator-=(const vec3& other) { gsl_vector_sub(vec,other.vec); return *this; }
    vec3& operator+=(const vec3& other) { gsl_vector_add(vec,other.vec); return *this; }
    bool operator==(const vec3& other) const { return x()==other.x()&&y()==other.y()&&z()==other.z(); }
    bool operator<(const vec3& other) const { return norm() < other.norm(); }
    bool operator>(const vec3& other) const { return norm() > other.norm(); }
    bool operator<=(const vec3& other) const { return norm() <= other.norm(); }
    bool operator>=(const vec3& other) const { return norm() >= other.norm(); }
    
}; // convenience wrapper for gsl_vector of size 3
typedef struct vec3 vec3;

// Hash definitions
namespace std {
    template <>
    struct hash<vec3> {
        size_t operator()(const vec3& v) const {
            return (size_t)(hash<int>{}(v.x())%hash<int>{}(v.y())*hash<int>{}(v.z()));
        }
    };
    template <>
    struct hash<vec3*> {
        size_t operator()(const vec3*& v) const {
            return (size_t)(hash<vec3>{}(*v));
        }
    };
    template <>
    struct hash<vector<vec3>> {
        size_t operator()(const vector<vec3>& v) const {
            size_t h = 0;
            for (auto vec : v) { h *= 17; h %= hash<vec3>{}(vec); }
            return h;
        }
    };
    template <>
    struct hash<vector<vec3*>> {
        size_t operator()(const vector<vec3*>& v) const {
            size_t h = 0;
            for (auto vec : v) { h *= 17; h %= hash<vec3>{}(*vec); }
            return h;
        }
    };
}

static const vec3 X_HAT = vec3(1,0,0);
static const vec3 Y_HAT = vec3(0,1,0);
static const vec3 Z_HAT = vec3(0,0,1);
static const vec3 MINUS_X_HAT = vec3(-1,0,0);
static const vec3 MINUS_Y_HAT = vec3(0,-1,0);
static const vec3 MINUS_Z_HAT = vec3(0,0,-1);
static const vec3 ZERO_VEC = vec3();


#endif