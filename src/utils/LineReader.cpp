#include "LineReader.h"

LineReader::LineReader(const std::string& input) : m_input(input), m_pos(0U), m_good(true)
{
}

std::string LineReader::read()
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

