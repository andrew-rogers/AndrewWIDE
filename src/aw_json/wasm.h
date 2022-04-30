#ifndef WASM_H
#define WASM_H

#include "plot.h"
#include "math.h"
#include "awmath.h"

#include <stdlib.h>
#include <string.h>
#include <emscripten.h>

char *g_str_query;
std::string g_str_response;
Json g_query;
Json g_response;

EMSCRIPTEN_KEEPALIVE
extern "C" void set_query(char* query)
{
    g_str_query = (char*)malloc(strlen(query)+1);
    if(g_str_query)
    {
        char* p=query;
        char* o=g_str_query;
        while(*p != '\0')
        {
            *o = (*p);
            o++;
            p++;
        }
        *o = '\0';
    }
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
