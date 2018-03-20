/*
    AndrewWIDE - JSON parse and stringify
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

#include "json.h"

using namespace std;

JsonTokeniser::JsonTokeniser(istream& in) : in(in)
{
}

bool JsonTokeniser::nextToken(char& type, std::string& str)
{
    type='\0';
    bool result(false);
    str="";
    if( in >> skipws >> type )
    {
        switch(type)
        {
            
            // String
            case '\'':
            case '"':
            {   
                in.unget();
                result=parseString(in, str);
                break;
            }

            // Number
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '-':
            case '+':
            {
                in.unget();
                result=parseNumber(in, str);
                type='0';
                break;
            }

            case '{':
            case '[':
            case ':':
            case ',':
            {
                result=true;
                break;
            }

            // true
            case 't':
            {
                in.unget();
                result=parseTrue(in);
                break;
            }
            // false
            case 'f':
            {
                in.unget();
                result=parseFalse(in);
                break;
            }
            // null
            case 'n':
            {
                in.unget();
                result=parseNull(in);
                break;
            }

            default:
            {
                result=false;
            }
        }
          
    }
    return result;
}

bool JsonTokeniser::parseString(istream& in, string& str)
{
    char quote_char('\0');
    in >> quote_char;
    bool result(false);
    bool done(false);
    str="";
    
    if( quote_char == '"' )
    {
        char c;
        while( !done && (in >> noskipws >> c) )
        {
            switch(c)
            {
                case '\\':
                {
                    if( in >> c )
                    {
                        if( c == 't' ) c='\t';
                        else if( c == 'n' ) c='\n';
                        else if( c == 'r' ) c='\r';
                        str=str+c;
                    }
                    break;
                }

                case '"':
                {
                    result=true;
                    done=true;
                    break;
                }

                default:
                {
                    str=str+c;
                }
            }
        }
    }
    return result;
}

bool JsonTokeniser::parseNumber(istream& in, string& str)
{
}

bool JsonTokeniser::parseTrue(istream& in)
{
}

bool JsonTokeniser::parseFalse(istream& in)
{
}

bool JsonTokeniser::parseNull(istream& in)
{
}

Json::Json() : m_tokeniser(0), m_type(undefined_type), m_str(0), m_pairs(0), m_values(0)
{
}

bool Json::parse(istream& in)
{
    if(m_tokeniser) delete m_tokeniser;   
    m_tokeniser=new JsonTokeniser(in);
    return parse(*m_tokeniser);
}

bool Json::parse(JsonTokeniser& tokeniser)
{
    char type('\0');
    string str;
    string key;
    Json* value(0);
    bool done(false);
    bool error(false);
    State state;
    while( !done && !error && tokeniser.nextToken(type, str) )
    {
        switch(m_type)
        {
            case undefined_type:
            {
                switch(type)
                {
                    case '"':
                    case '\'':
                    {
                        m_type=string_type;
                        m_str=new string;
                        *(m_str)=str;
                        done=true;
                        break;
                    }
                    case '0':
                    {
                        m_type=number_type;
                        m_str=new string;
                        *(m_str)=str;
                        done=true;
                        break;
                    }
                    case '{':
                    {
                        m_type=object_type;
                        m_pairs = new map<std::string, Json*>;
                        state=state_key;
                        break;
                    }

                    case '[':
                    {
                        m_type=array_type;
                        m_values = new vector<Json*>;
                        value=new Json();
                        if( value->parse(tokeniser) )
                        {
                            m_values->push_back(value);
                            state=state_comma;
                        }
                        else
                        {
                            if(value->getLastToken() == ']')
                            {
                                done=true;
                            }
                            else
                            {
                                error=true;
                            }
                            delete value;
                        } 
                        break;
                    }
                    default:
                    {
                        error=false;
                    }
                }
                break;
            }

            case object_type:
            {
                switch(state)
                {
                    case state_key:
                    {
                        switch(type)
                        {
                            case '"':
                            {
                                key=str;
                                state=state_colon;
                                break;
                            }
                            default:
                            {
                                error=true;
                            }
                        }
                        break;
                    }
                    case state_colon:
                    {
                        if( type == ':' )
                        {
                            value=new Json();
                            if( value->parse(tokeniser) )
                            {
                                (*(m_pairs))[key]=value;
                                state=state_comma;
                            }
                            else
                            {
                                delete value;
                                error=true;
                            } 
                        }
                        else error=true;
                        break;
                    }
                    case state_comma:
                    {
                        switch(type)
                        {
                            case ',':
                            {
                                state=state_key;
                                break;
                            }
                            case '}':
                            {
                                done=true;
                                break;
                            }
                            default:
                            {
                                error=true;
                            }
                        }
                        break;
                    }
                }
                break;
            } // case object_type

            case array_type:
            {
                switch(state)
                {
                    case state_comma:
                    {
                        switch(type)
                        {
                            case ',':
                            {
                                value=new Json();
                                if( value->parse(tokeniser) )
                                {
                                    m_values->push_back(value);
                                    state=state_comma;
                                }
                                else
                                {
                                    error=true;
                                    delete value;
                                } 
                                break;
                            }
                            case '}':
                            {
                                done=true;
                                break;
                                break;
                            }
                        }
                        break;
                    }
                }
                break;
            }

            default:
            {
                error=true;
            }
        } // swicth(m_type)
          
    } // while()
    m_lastToken=type;
    return !error;
}

void Json::stringify(ostream& out)
{
    switch(m_type)
    {
        case string_type:
        {
            out << "\"";
            for( int i=0; i<m_str->length(); i++)
            {
                char c=(*m_str)[i];
                if( c=='\t' ) out << "\\t";
                else if( c=='\n' ) out << "\\n";
                else if( c=='\r' ) out << "\\r";
                else if( c=='\"' ) out << "\\\"";
                else if( c=='\\' ) out << "\\\\";
                else out << c;
            }
            out << "\"";
            break;
        }
        case object_type:
        {
            out << "{";
            bool first(true);
            for(map<string,Json*>::iterator it=m_pairs->begin(); it!=m_pairs->end(); ++it)
            {
                if(!first) cout<<",";
                string key=it->first;
                Json* value=it->second;
                out << "\"" << key << "\":";
                value->stringify(out);
                first=false;
            }   
            out << "}";
            break;
        }
        case array_type:
        {
            out << "[";
            for(int i=0; i<m_values->size()-1; i++)
            {
                Json* value=(*(m_values))[i];
                value->stringify(out);
                cout<<",";
            }
            Json* value=(*(m_values))[m_values->size()-1];
            value->stringify(out);   
            out << "]";
            break;
        }
    }
}

char Json::getLastToken()
{
    return m_lastToken;
}

Json& Json::operator[](const std::string& key)
{
    // If not found create new element
}

istream& operator>>(istream& in, Json& value)
{
    value.parse(in);
    return in;
}

ostream& operator<<(ostream& out, Json& value)
{
    value.stringify(out);
    return out;
}





