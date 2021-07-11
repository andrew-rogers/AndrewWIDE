#include "../../src/aw_json/aw_json.h"
#include "../../src/cgi/trace.h"

int main( int argc, char* args[])
{
    AwVector<double> y; // TODO: Support plot from memory buffer for instrumenting code. 
    for (int i=0; i<500; i++)
    {
        double w=(i%50)/25.0;
        AW_TRACE(w);
        double q=(i%54)/27.0;
        AW_TRACE(q);
        y.push_back(w);
    }
    plot(y);
    AwJson::save("instrument_test.html");
}

