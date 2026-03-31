cmake_minimum_required(VERSION 3.16)
project(service_a)

set(CMAKE_CXX_STANDARD 17)

# Find GSL via pkg-config
find_package(PkgConfig REQUIRED)
pkg_check_modules(GSL REQUIRED gsl)

add_executable(service_a src/main.cpp)

target_include_directories(service_a PRIVATE ${GSL_INCLUDE_DIRS})
target_link_libraries(service_a PRIVATE ${GSL_LIBRARIES})
target_compile_options(service_a PRIVATE ${GSL_CFLAGS_OTHER})