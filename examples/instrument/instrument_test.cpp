#include "../../src/aw_json/aw_json.h"

int main( int argc, char* args[])
{
    AwVector<double> y; // TODO: Support plot from memory buffer for instrumenting code. 
    for (int i=0; i<500; i++) y.push_back((i%50)/25.0);
    plot(y);
    AwJson::save("instrument_test.html");
}

