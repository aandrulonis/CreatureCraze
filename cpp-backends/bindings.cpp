#include <emscripten/bind.h>
#include "math-utils/vector.h"
#include "math-utils/matrix.h"
#include <gsl/gsl_vector.h>
#include <gsl/gsl_math.h>
#include "motorcycle-racer/motorcycle_dynamics.h"
#include "graphics/object.h"
#include "graphics/scene.h"
#include "graphics/shapes/3D/ellipsoid.h"
#include "graphics/shapes/3D/shape3d.h"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(cpp_utils) {
    class_<vec3>("vec3")
        .constructor<double, double, double>()
        .function("copy", &vec3::copy)
        .function("x", &vec3::x)
        .function("y", &vec3::y)
        .function("z", &vec3::z)
        .function("setX", &vec3::setX)
        .function("setY", &vec3::setY)
        .function("setZ", &vec3::setZ)
        .function("dot", &vec3::dot)
        .function("cross", &vec3::cross)
        .function("norm", &vec3::norm)
        .function("unitVec", &vec3::unit_vec)
        .function("plus", select_overload<vec3(const vec3&) const>(&vec3::operator+))
        .function("minus", select_overload<vec3(const vec3&) const>(&vec3::operator-))
        .function("times", select_overload<vec3(const vec3&) const>(&vec3::operator*))
        .function("divide", select_overload<vec3(const vec3&) const>(&vec3::operator/))
        .function("add", optional_override([](vec3& self, const vec3& other) {
            self += other;
            return self;
        }))
        .function("subtract", optional_override([](vec3& self, const vec3& other) {
            self -= other;
            return self;
        }))
        .function("equals", select_overload<bool(const vec3&) const>(&vec3::operator==));

    class_<matrix33>("matrix33")
        .constructor<>()
        .function("set", select_overload<void(int, int, double)>(&matrix33::set))
        .function("transpose", &matrix33::transpose)
        .function("apply", &matrix33::apply);
    
    class_<Scene>("Scene")
        .constructor<vec3, vec3>()
        .function("triangulate", &Scene::triangulate)
        .function("computeColors", &Scene::compute_colors)
        .function("addObject", &Scene::add_object)
        .function("getVertexIndices", &Scene::get_vertex_indices)
        .function("getVertexPositions", &Scene::get_vertex_positions)
        .function("getVertexColors", &Scene::get_vertex_colors)
        .function("numTriangles", &Scene::get_num_triangles)
        .function("numVertices", &Scene::get_num_vertices);

    class_<Shape3D>("Shape3D");
    class_<Ellipsoid, emscripten::base<Shape3D>>("Ellipsoid")
        .constructor<double, double, double, double, double, vec3, vec3>();
    class_<Object3D>("Object3D")
        .constructor<>()
        .function("addShape", &Object3D::add_shape);

     class_<MotorcycleDynamics>("MotorcycleDynamics")
        .constructor<vec3, vec3, double, double, double, double, double, double, double, double, double, double>()
        .function("stop", &MotorcycleDynamics::stop)
        .function("setThrust", &MotorcycleDynamics::set_thrust)
        .function("setRoll", &MotorcycleDynamics::set_roll)
        .function("propagate", &MotorcycleDynamics::propagate)
        .function("inertialToPOV", &MotorcycleDynamics::inertial_to_POV);
 }