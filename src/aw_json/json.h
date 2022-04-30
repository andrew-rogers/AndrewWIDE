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

#ifndef JSON_H
#define JSON_H

#include <memory>
#include <iostream>
#include <map>
#include <vector>

class JsonTokeniser
{
public:
    JsonTokeniser(std::istream& in);
    bool nextToken(char& type, std::string& str);
private:
    bool parseString(std::istream& in, std::string& str);
    bool parseNumber(std::istream& in, std::string& str);
    bool parseTrue(std::istream& in);
    bool parseFalse(std::istream& in);
    bool parseNull(std::istream& in);

    std::istream& in;
};

class Json
{
   
public:
    Json();
    ~Json();
    bool parse(std::istream& in);
    bool parse(JsonTokeniser& tokeniser);
    void stringify(std::string& out) const;
    char getLastToken();
    std::string str();
    double toNumber() const;
    Json& operator[](const std::string& key);
    Json& operator[](int index);
    void push_back(Json& value);
    Json& operator=(const std::string& val);
    Json& operator=(const double& val);
    int length() const;
private:
    enum Type
    {
        undefined_type,
        string_type,
        number_type,
        object_type,
        array_type,
        true_type,
        false_type,
        null_type
    };

    enum State
    {
        state_key,
        state_colon,
        state_value,
        state_comma
    };
  
    Type m_type;
    std::shared_ptr<std::string> m_str;
    std::shared_ptr<std::map<std::string, Json> > m_pairs;
    std::shared_ptr<std::vector<Json> > m_values;
    char m_lastToken;
};
std::istream& operator>>(std::istream& in, Json& value);
std::ostream& operator<<(std::ostream& out, Json& value);


#endif // JSON_H

