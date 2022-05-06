#include "LineReader.h"

std::vector<Line> Line::split(const std::string& delim)
{
    std::vector<Line> ret;
    std::size_t pos = 0U;
    std::size_t found;
    while ( (found = find(delim, pos)) != std::string::npos)
    {
        Line l( substr( pos, found-pos ) );
        ret.push_back( l );
        pos = found + delim.size();
    }
    Line l( substr( pos, delim.size()-pos ) );
    ret.push_back( l );
    return ret;
}

LineReader::LineReader(const std::string& input) : m_input(input), m_pos(0U), m_good(true)
{
}

Line LineReader::read()
{
    std::string line;
    std::size_t found = m_input.find("\n", m_pos);
    if (found != std::string::npos)
    {
        std::size_t i1 = found;
        if ((found > 0) && (m_input[found-1]=='\r')) i1 = found - 1;
        line = m_input.substr(m_pos, i1-m_pos);
        m_pos = found + 1;
    }
    else
    {
        m_good = false;
    }
    return line;
}

