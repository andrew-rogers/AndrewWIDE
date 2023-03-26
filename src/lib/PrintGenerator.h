/*
 * AndrewWIDE - Generate JSON responses for print strings.
 * Copyright (C) 2023  Andrew Rogers
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

#ifndef PRINT_GENERATOR_H
#define PRINT_GENERATOR_H

#include "Json.h"
#include "ResponseGenerator.h"

class PrintGenerator : public ResponseGenerator
{
public:
    PrintGenerator() : m_obj( new JsonObject )
    {
        m_current = this;
        JsonObject* obj = m_obj.get();
        obj->addMember("cmd","print");
    }

    void print(const std::string& str)
    {
        m_str+=str;
    }

    virtual JsonValue* generate()
    {
        m_current = NULL;
        JsonObject* obj = m_obj.get();
        obj->addMember("str",m_str);
        return obj;
    }

    static PrintGenerator* current()
    {
        if (m_current == NULL)
        {
            m_current = new PrintGenerator;
            g_response_generators.push_back(m_current);
        }
        return m_current;
    }

private:
    std::shared_ptr<JsonObject> m_obj;
    std::string m_str;
    static PrintGenerator* m_current;
};

void print(const std::string& str);

#endif // PRINT_GENERATOR_H

