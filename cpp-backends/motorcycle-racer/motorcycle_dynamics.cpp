#include "motorcycle_dynamics.h"

MotorcycleDynamics::MotorcycleDynamics(const vec3 &body_rel_pos, const vec3 &wind_vel0, double cd, double cM, double cL, double lref, double sref, 
                                       double rho, double mass, double Ixx, double Iyy, double Izz) : 
                                       body_rel_pos(body_rel_pos), wind_vel(wind_vel0), cd(cd), cM(cM), cL(cL), lref(lref), sref(sref),
                                       rho(rho), mass(mass), Ixx(Ixx), Iyy(Iyy), Izz(Izz) {
    pos_I = vec3();
    vel_I = vec3();
    acc_I = vec3();
    alpha = vec3();
    omega = vec3();
    angle = vec3();
    n = vec3(0,0,1);
    q0 = q1 = q2 = q3 = roll = T = 0.;
    R1 = matrix33();
    R2 = matrix33();
}



void MotorcycleDynamics::propagate(double dt) {
    update_acc();
    vec3 dv = acc_I.copy();
    dv.scale(dt);
    vec3 ds = vel_I.copy();
    ds.scale(dt);
    vel_I += dv;
    pos_I += ds;
    vec3 d_omega = alpha.copy();
    d_omega.scale(dt);
    vec3 d_angle = omega.copy();
    d_angle.scale(dt);
    omega += d_omega;
    angle += d_angle;
    vec3 u = vec3(cos(angle.x()), cos(angle.y()), cos(angle.z())); // vector which our quaternion should rotate into z hat
    vec3 AOR = u.cross(Z_HAT).unit_vec(); // axis of rotation to define quaternion
    double theta = acos(u.dot(Z_HAT))/u.norm(); // angle of rotation
    double sin_theta_ov_2 = sin(theta/2);
    q0 = cos(theta/2);
    q1 = sin_theta_ov_2*AOR.x();
    q2 = sin_theta_ov_2*AOR.y();
    q3 = sin_theta_ov_2*AOR.z();
    R1.set(
        q1*q1+q0*q0-q3*q3-q2*q2,
        2*q1*q2-2*q0*q3,
        2*q1*q3+2*q0*q2,
        2*q1*q2+2*q0*q3,
        q2*q2-q3*q3+q0*q0-q1*q1,
        2*q2*q3-2*q0*q1,
        2*q1*q3-2*q0*q2,
        2*q2*q3+2*q0*q1,
        q3*q3-q2*q2-q1*q1+q0*q0
    ); // rotation matrix to point in the direction of the cyclist POV
    R2.set(
        cos(roll),
        sin(roll),
        0,
        -sin(roll),
        cos(roll),
        0,
        0,
        0,
        1
    ); // rotation matrix to rotate by -roll angle about z-axis
}

void MotorcycleDynamics::update_acc() {
    // Normal force from surface
    vec3 N = vec3(0);
    if (!(n == ZERO_VEC)) {
        N = R2.transpose().apply(R1.apply(n)); // normal force direction in body frame, rotated by +roll about body frame z-axis
        N.scale(N.dot(g));
    }

    // Freestream air velocity
    vec3 vinf = vel_I.copy();
    vinf.scale(-1);
    vinf += wind_vel;
    double vinf_sqr = vinf.dot(vinf);

    // Aerodynamic forces
    vec3 D, L;
    D = L = vec3(0);
    if (!(vel_I == ZERO_VEC)) {
        // Drag
        D = vinf.unit_vec();
        D.scale(-cd*rho*vinf_sqr*sref/mass);

        // Lift
        L = vec3(0,1,0);
        L = R1.transpose().apply(R2.transpose().apply(L)); // body frame y-hat in inertial coordinates
        L = L.cross(vinf).unit_vec(); // lift is normal to body frame y-hat and freestream velocity
        L.scale(cL*rho*vinf_sqr*sref/mass);
    }

    // Thrust
    vec3 T_acc = vec3(0,0,-1);
    T_acc = R1.transpose().apply(T_acc); // body frame minus z-hat in inertial coordinates
    T_acc.scale(T/mass);
    
    acc_I = g + N + D + L + T_acc; // linear acceleration

    alpha.setY(cM*rho*vinf_sqr*sref*lref/Iyy); // Pitching
   // alpha.setX(beta*cnBeta*cp*vinf_sqr*sref*lref/Ixx); // Yawing
    
}

void MotorcycleDynamics::inertial_to_POV(vec3 &pos) {
    // body frame is defined with y being horizontal LOS, x being vertical LOS, z motorcycle's longitudinal axis, origin at body COM
    // https://engineering.purdue.edu/CCE/Academics/Groups/Geomatics/DPRG/Courses_Materials/Photogrammetry_2018/AKAM_Quaternion_AKAM.pdf
    pos -= pos_I; // relative to body frame origin
    pos = R2.apply(R1.apply(pos));
    pos += body_rel_pos;
}
