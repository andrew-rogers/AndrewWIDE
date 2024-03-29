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

#include "Json.h"
#include "ResponseGenerator.h"
#include "WasmVectors.h"
#include "wasm_buffers.h"
#include <memory>

class PlotTrace : public JsonObject
{
public:
    PlotTrace& marker( const std::string& str );

    PlotTrace& name( const std::string& str)
    {
        addMember("name", str);
        return *this;
    }

    PlotTrace& setX( const std::string& str)
    {
        addMember("vecname_x", str);
        return *this;
    }

    PlotTrace& setY( const std::string& str)
    {
        addMember("vecname_y", str);
        return *this;
    }
};

class PlotInfo : public JsonObject
{
public:
    PlotInfo()
    {
        addMember("cmd","plot");
        addMember("data",m_arr);
        addMember("wasmvectors", m_wvs);
    }

    PlotTrace* createTrace()
    {
        auto p_info = new PlotTrace;
        m_traces.push_back(p_info);
        m_arr.addElement(*p_info);
        return p_info;
    }

    JsonObject createVector(const std::string& vec_name)
    {
        JsonObject vec;
        vec.addMember("vec_name", vec_name);
        m_wvs.addElement(vec);
        return vec;
    }

    size_t size() const
    {
        return m_traces.size();
    }

private:
    JsonArray m_arr;
    JsonArray m_wvs;
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
    PlotTrace& addHeatmap(const WasmVector<T>& z, size_t n_rows, size_t n_cols)
    {
        std::string vec_name = g_output_vectors.add(z);
        auto index = m_data.get()->size();
        auto p_trace = m_data.get()->createTrace();
        auto p_vecinfo = m_data.get()->createVector(vec_name);
        p_trace->addMember("type","heatmap");
        p_trace->addTrue("transpose");
        JsonArray dim;
        dim.addElement( n_rows );
        dim.addElement( n_cols );
        p_vecinfo.addMember("dim", dim);
        std::string member = "data[";
        member += std::to_string(index);
        member += "].z";
        p_vecinfo.addMember("member", member);
        return *p_trace;
    }

    template <typename T>
    PlotTrace& addTrace(const WasmVector<T>& y)
    {
        std::string vec_name = g_output_vectors.add(y);
        auto p_trace = m_data.get()->createTrace();
        p_trace->setY(vec_name);
        return *p_trace;
    }

    template <typename T>
    PlotTrace& addTrace(const WasmVector<T>& x, const WasmVector<T>& y)
    {
        std::string vec_name_x = g_output_vectors.add(x);
        std::string vec_name_y = g_output_vectors.add(y);
        auto p_trace = m_data.get()->createTrace();
        p_trace->setX(vec_name_x);
        p_trace->setY(vec_name_y);
        return *p_trace;
    }

    virtual JsonValue* generate()
    {
        m_current = NULL;
        return m_data.get();
    }

    static PlotGenerator* current()
    {
        if (m_current == NULL)
        {
            m_current = new PlotGenerator;
            g_response_generators.push_back(m_current);
        }
        return m_current;
    }

    void unitCircle(const std::string& linestyle = "");
    void xlabel(const std::string& str);
    void ylabel(const std::string& str);

private:
    std::shared_ptr<PlotInfo> m_data;
    static PlotGenerator* m_current;
};

template <typename T>
PlotTrace& plot(const WasmVector<T>& y)
{
    auto plot = PlotGenerator::current();
    PlotTrace& trace = plot->addTrace(y);
    return trace;
}

template <typename T>
PlotTrace& plot(const WasmVector<T>& x, const WasmVector<T>& y)
{
    auto plot = PlotGenerator::current();
    PlotTrace& trace = plot->addTrace(x,y);
    return trace;
}

template <typename T>
PlotTrace& heatmap(const WasmVector<T>& z, size_t n_rows, size_t n_cols)
{
    auto plot = PlotGenerator::current();
    PlotTrace& trace = plot->addHeatmap(z, n_rows, n_cols);
    return trace;
}

void unitCircle(const std::string& linestyle = "");
void xlabel( const std::string& str);
void ylabel( const std::string& str);

#endif // PLOT_GENERATOR_H

