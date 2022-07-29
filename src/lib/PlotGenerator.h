/*
 * AndrewWIDE - Generate JSON responses for graph plotting.
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

#ifndef PLOT_GENERATOR_H
#define PLOT_GENERATOR_H

#include "ResponseGenerator.h"
#include "WasmVectors.h"
#include "wasm_buffers.h"

class JsonStr
{
public:
    static std::string pair(const std::string& key, const std::string& val)
    {
        return quoteString(key) + ":" + quoteString(val);
    }

    static std::string quoteString(const std::string& str)
    {
        std::string ret = "\"" + str + "\"";
        return ret;
    }
};

class PlotTrace
{
public:
    PlotTrace& name( const std::string& str)
    {
        m_name = str;
        return *this;
    }

    PlotTrace& setY( const std::string& str)
    {
        m_vecname_y = str;
        return *this;
    }

    std::string toJson()
    {
        std::string ret = "{" + JsonStr::pair("name", m_name) + ",";
        ret += JsonStr::pair("vecname_y", m_vecname_y);
        return ret + "}";
    }

private:
    std::string m_name;
    std::string m_vecname_y;
};

class PlotInfo
{
public:
    PlotTrace* createTrace()
    {
        auto p_info = new PlotTrace;
        m_traces.push_back(p_info);
        return p_info;
    }

    std::string toJson()
    {
        std::string str="[";
        for (size_t i=0; i<m_traces.size(); i++)
        {
            if (i>0) str+=",";
            str+=m_traces[i]->toJson();
        }
        return str+"]";
    }

private:
    std::vector<PlotTrace*> m_traces;
};

class PlotGenerator : public ResponseGenerator
{
public:
    PlotGenerator() : m_data( new PlotInfo )
    {
        m_current = this;
    }

    template <typename T>
    PlotTrace& addTrace(const WasmVector<T>& y)
    {
        std::string vec_name = g_output_vectors.add(y);
        auto p_trace = m_data.get()->createTrace();
        p_trace->setY(vec_name);
        return *p_trace;
    }

    virtual void generate()
    {
        std::string data = m_data.get()->toJson();
        std::string js = "{\"cmd\":\"plot\",\"data\":" + data + "}";
        jsrt_add_response_cmd(js.c_str());
        m_current = NULL;
    }

    static PlotGenerator* current()
    {
        return m_current;
    }

private:
    std::shared_ptr<PlotInfo> m_data;
    static PlotGenerator* m_current;
};

template <typename T>
PlotTrace& plot(const WasmVector<T>& y)
{
    auto plot = PlotGenerator::current();
    if (plot==NULL)
    {
        plot = new PlotGenerator;
        g_response_generators.push_back(plot);
    }
    PlotTrace& trace = plot->addTrace(y);
    return trace;
}

#endif // PLOT_GENERATOR_H

