#ifndef MATRIX_H
#define MATRIX_H

#include <gsl/gsl_matrix.h>
#include <gsl/gsl_blas.h>
#include "vector.h"



struct matrix33 {
    gsl_matrix *matrix;

    matrix33(double x11, double x12, double x13, double x21, double x22, double x23, double x31, double x32, double x33) {
        matrix = gsl_matrix_calloc((size_t) 3, (size_t) 3);
        set(x11, x12, x13, x21, x22, x23, x31, x32, x33);
    }
    matrix33() { matrix = gsl_matrix_calloc((size_t) 3, (size_t) 3); }
    ~matrix33() { gsl_matrix_free(matrix); }

    void set(double x11, double x12, double x13, double x21, double x22, double x23, double x31, double x32, double x33) {
        gsl_matrix_set(matrix,0,0,x11);
        gsl_matrix_set(matrix,0,1,x12);
        gsl_matrix_set(matrix,0,2,x13);
        gsl_matrix_set(matrix,1,0,x21);
        gsl_matrix_set(matrix,1,1,x22);
        gsl_matrix_set(matrix,1,2,x23);
        gsl_matrix_set(matrix,2,0,x31);
        gsl_matrix_set(matrix,2,1,x32);
        gsl_matrix_set(matrix,2,2,x33);
    }
    void set(int i, int j, double x) { gsl_matrix_set(matrix, i, j, x); }
    matrix33 transpose() const { const matrix33 m = matrix33(); gsl_matrix_transpose_memcpy(m.matrix, matrix); return m; }
    vec3 apply (const vec3 &x) const { 
        const vec3 y = vec3();
        gsl_blas_dgemv(CblasNoTrans, 1., matrix, x.vec, 0. ,y.vec);
        return y;
    }
}; // convenience wrapper for gsl matrix of size 3x3
typedef struct matrix33 matrix33;




#endif