#ifndef MOTORCYCLE_DYNAMICS_H
#define MOTORCYCLE_DYNAMICS_H

#include "../math-utils/vector.h"
#include "../math-utils/matrix.h"

static const vec3 g = vec3(0,0,-9.80665);

class MotorcycleDynamics {

    private:
        vec3 pos_I; // inertial environment coordinate system position
        vec3 vel_I; // inertial environment coordinate system velocity 
        vec3 acc_I; // inertial environment coordinate system acceleration
        vec3 alpha, omega, angle; // body angular acceleration, angular velocity, and angular position
        vec3 body_rel_pos; // POV to body COM position in body frame
        vec3 n; // surface normal in inertial environment coordinate system; zero if not on the ground
        vec3 wind_vel; // inertial environment coordinate system position
        double q0, q1, q2, q3; // quaternions
        double roll; // roll angle (CCW from unrotated body frame +x axis)
  //      double mu_s, mu_k; // surface coefficients of friction
        double cd, cM, cL, lref, sref; // aerodynamic coefficients and reference length&area
        double T; // thrust force, assumed to be in +z body frame direction
        double rho; // air density
        double mass, Ixx, Iyy, Izz;
        matrix33 R1, R2; // matrices to transform to body-centered frame and apply roll, respectively

        void update_acc();
    
    public:
        MotorcycleDynamics(const vec3 &body_rel_pos, const vec3 &wind_vel0, double cd, double cM, 
                            double cL, double lref, double sref, double rho, double maxx, double Ixx, double Iyy, double Izz);
        inline void stop() { vel_I = ZERO_VEC; }
        inline void set_thrust(double T_new) { T = T_new; }
        inline void set_roll(double roll_new) { roll = roll_new; }
        void propagate(double dt);
        void inertial_to_POV(vec3 &pos);

};




#endif