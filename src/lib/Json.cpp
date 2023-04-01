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

#include "Json.h"

// https://www.json.org/json-en.html

std::string JsonString::toJson()
{
    std::string str = "\"";
    for (size_t i = 0U; i<m_str.length(); i++)
    {
        char c = m_str[i];
        switch (c)
        {
        case '\\':
            str += "\\\\";
            break;
        case '\n':
            str += "\\n";
            break;
        case '\t':
            str += "\\t";
            break;
        default:
            str += c;
        }
    }
    str += '"';
    return str;
}

void JsonObject::addMember( const std::string& key, const JsonArray& val )
{
    m_keys.get()->push_back(new JsonString(key));
    m_vals.get()->push_back(new JsonArray(val));
}

void JsonObject::addMember( const std::string& key, const JsonObject& val )
{
    m_keys.get()->push_back(new JsonString(key));
    m_vals.get()->push_back(new JsonObject(val));
}

void JsonObject::addMember( const std::string& key, const std::string& val )
{
    m_keys.get()->push_back(new JsonString(key));
    m_vals.get()->push_back(new JsonString(val));
}

void JsonObject::addMember( const std::string& key, double val )
{
    m_keys.get()->push_back(new JsonString(key));
    m_vals.get()->push_back(new JsonNumber(val));
}

void JsonObject::addTrue( const std::string& key )
{
    m_keys.get()->push_back(new JsonString(key));
    m_vals.get()->push_back(new JsonBoolean(true));
}

std::string JsonObject::toJson()
{
    std::string str="{";
    for (size_t i=0; i<m_keys.get()->size(); i++)
    {
        if (i>0) str += ",";
        str += (*m_keys.get())[i]->toJson();
        str += ":";
        str += (*m_vals.get())[i]->toJson();
    }
    str += "}";
    return str;
}

