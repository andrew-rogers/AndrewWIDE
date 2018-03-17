/*
    AndrewWIDE - POST to hexdump CGI
    Copyright (C) 2018  Andrew Rogers

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/


#include <iostream>
#include <iomanip>

using namespace std;

void dump(char *data, int length);
string dumpLine(char *data, int length);

int main(int argc, char *args[])
{
    char *length_str=getenv("CONTENT_LENGTH");
	cout<<"Content-type: text/plain"<<endl<<endl;

    if(length_str)
    {
        int length=atoi(length_str);
        int max_length=1024*1024;
        if(length>max_length)
        {
            cout<<"Too much POST, "<<length<<" bytes, maximum is "<<max_length<<"bytes."<<endl;
        }
        else
        {
            char post_data[length];
            cin.read(post_data,length);
            dump(post_data,length);
        }
    }
    else
    {
	    cout<<"Not valid POST! - no CONTENT_LENGTH."<<endl;
    }
 
	return 0;
}

void dump(char *data, int length)
{
    for( int i=0; i<length; i+=16)
    {
        int ll=length-i;
        if(ll>16) ll=16;
        string str=dumpLine(&data[i],ll);
        cout << str << endl;
    }
}

string dumpLine(char *data, int length)
{
    stringstream ss_hex;
    stringstream ss_txt;
    for( int i=0; i<length; i++)
    {
        if(i==8)ss_hex << " ";
        int val = data[i]&0xff;
        ss_hex << hex << setfill('0') << setw(2) << val << " ";
        if(val>=32 && val<128) ss_txt << static_cast<char>(val);
        else ss_txt << ".";
    }
    string str=ss_hex.str()+" |"+ss_txt.str()+"|";
    ss_hex.clear();
    ss_txt.clear();
    return str;
}
