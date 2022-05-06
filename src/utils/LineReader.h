#ifndef LINEREADER_H
#define LINEREADER_H

#include <string>
#include <vector>

class Line : public std::string
{
public:
    Line( const std::string& str) : std::string(str)
    {
    }
    std::vector<Line> split(const std::string& delim);
};

class LineReader
{
public:
    LineReader(const std::string& input);
    Line read();
    bool good() const
    {
        return m_good;
    }

private:
    const std::string& m_input;
    std::size_t m_pos;
    bool m_good;
};

#endif // LINEREADER_H

