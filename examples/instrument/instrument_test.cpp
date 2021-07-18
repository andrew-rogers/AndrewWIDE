#include "../../src/aw_json/aw_json.h"
#include "../../src/cgi/trace.h"

#include <fstream>

using namespace std;

int main( int argc, char* args[])
{
    ofstream wout("instrument_test_vec_1.txt");

    AwVector<double> y; // TODO: Support plot from memory buffer for instrumenting code. 
    for (int i=0; i<500; i++)
    {
        double w=(i%50)/25.0;
        AW_TRACE(w);
        double q=(i%54)/27.0;
        AW_TRACE(q);
        y.push_back(w);
        wout << w << endl;
    }
    plot(y);
    AwJson::save("instrument_test.html");
    wout.close();
}

