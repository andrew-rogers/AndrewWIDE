/*
 * AndrewWIDE - Simple JSON.
 * Copyright (C) 2022  Andrew Rogers
 *
 * SPDX-License-Identifier: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#ifndef JSON_H
#define JSON_H

#include <vector>
#include <memory>
#include <string>

// https://www.json.org/json-en.html

class JsonValue
{
public:
    virtual std::string toJson() = 0;
};

class JsonBoolean : public JsonValue
{
public:
    JsonBoolean( bool val )
    {
        m_val = val;
    }
    virtual std::string toJson()
    {
        if (m_val) return "true";
        return "false";
    }
private:
    bool m_val;
};

class JsonNumber : public JsonValue
{
public:
    JsonNumber( double num )
    {
        m_num = num;
    }
    JsonNumber( size_t num )
    {
        m_num = num;
    }
    virtual std::string toJson()
    {
        return std::to_string(m_num);
    }
private:
    double m_num;
};

class JsonString : public JsonValue
{
public:
    JsonString( const std::string& str)
    {
        m_str = str;
    }
    virtual std::string toJson()
    {
        return "\"" + m_str + "\"";
    }
private:
    std::string m_str;
};

class JsonArray;

class JsonObject : public JsonValue
{
public:
    JsonObject() : m_keys( new std::vector<JsonString*> ), m_vals( new std::vector<JsonValue*> )
    {
    }
    void addMember( const std::string& key, const JsonArray& val );
    void addMember( const std::string& key, const JsonObject& val );
    void addMember( const std::string& key, const std::string& val );
    void addMember( const std::string& key, double val );
    void addTrue( const std::string& key );
    virtual std::string toJson();
private:
    std::shared_ptr<std::vector<JsonString*> > m_keys;
    std::shared_ptr<std::vector<JsonValue*> > m_vals;
};

class JsonArray : public JsonValue
{
public:
    JsonArray() : m_vals( new std::vector<JsonValue*> )
    {
    }
    void addElement( const JsonArray& val )
    {
        m_vals.get()->push_back(new JsonArray(val));
    }
    void addElement( const JsonObject& val )
    {
        m_vals.get()->push_back(new JsonObject(val));
    }
    void addElement( size_t val )
    {
        m_vals.get()->push_back(new JsonNumber(val));
    }
    void addElement( const std::string& val )
    {
        m_vals.get()->push_back(new JsonString(val));
    }
    virtual std::string toJson()
    {
        std::string str="[";
        for (size_t i=0; i<m_vals.get()->size(); i++)
        {
            if (i>0) str += ",";
            str += (*(m_vals.get()))[i]->toJson();
        }
        str += "]";
        return str;
    }
private:
    std::shared_ptr<std::vector<JsonValue*> > m_vals;
};

#endif // JSON_H

