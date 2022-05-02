#ifndef WASM_H
#define WASM_H

#include "plot.h"
#include "math.h"
#include "awmath.h"

#include <stdlib.h>
#include <string.h>
#include <emscripten.h>
#include <sstream>

std::string g_str_response;
Json g_query;
Json g_response;

EMSCRIPTEN_KEEPALIVE
extern "C" void set_query(char* query)
{
    istringstream in(query);
    in >> g_query;
}

EMSCRIPTEN_KEEPALIVE
extern "C" const char* get_response()
{
    Json resp;
    resp["array"] = g_response;
    resp["type"] = "array";
    resp.stringify(g_str_response);
    return g_str_response.c_str();
}

#endif // WASM_H
