#ifndef LINEREADER_H
#define LINEREADER_H

#include <string>

class LineReader
{
public:
    LineReader(const std::string& input);
    std::string read();
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

