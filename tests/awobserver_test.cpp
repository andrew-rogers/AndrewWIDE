#include <CppUTest/CommandLineTestRunner.h>
#include "awobserver.h"
#include "awsubject.h"

TEST_GROUP(ObserverTestGroup)
{
    class MyObserver : public AwObserver
    {
      public:
        uint32_t event;

        MyObserver() : event(0)
        {
        }

        virtual int onEvent(AwSubject &s, uint32_t e)
        {
            event = e;
        }

        ~MyObserver()
        {
        }
    };
};

TEST(ObserverTestGroup, FirstTest)
{
    AwSubject subject1;
    MyObserver observer1,observer2;

    subject1.notify(4);

    CHECK_EQUAL( 0, subject1.numObservers() );
    CHECK_EQUAL( 0, observer1.numSubjects() );

    subject1.addObserver( observer1 );
    CHECK_EQUAL( 1, subject1.numObservers() );
    CHECK_EQUAL( 1, observer1.numSubjects() );
    subject1.notify(9);
    CHECK_EQUAL( 9, observer1.event );

    subject1.addObserver( observer2 );
    CHECK_EQUAL( 2, subject1.numObservers() );
    CHECK_EQUAL( 1, observer1.numSubjects() );
    CHECK_EQUAL( 1, observer2.numSubjects() );

    subject1.removeObserver( observer1 );
    CHECK_EQUAL( 1, subject1.numObservers() );
    CHECK_EQUAL( 0, observer1.numSubjects() );
    CHECK_EQUAL( 1, observer2.numSubjects() ); 
}

TEST(ObserverTestGroup, SecondTest)
{
    AwSubject *subject1 = new AwSubject();
    MyObserver *observer1 = new MyObserver();
    MyObserver *observer2 = new MyObserver();

    CHECK_EQUAL( 0, subject1->numObservers() );
    CHECK_EQUAL( 0, observer1->numSubjects() );

    subject1->addObserver( observer1 );
    CHECK_EQUAL( 1, subject1->numObservers() );
    CHECK_EQUAL( 1, observer1->numSubjects() );

    subject1->addObserver( observer2 );
    CHECK_EQUAL( 2, subject1->numObservers() );
    CHECK_EQUAL( 1, observer1->numSubjects() );
    CHECK_EQUAL( 1, observer2->numSubjects() );

    delete observer1;
    CHECK_EQUAL( 1, subject1->numObservers() );
    CHECK_EQUAL( 1, observer2->numSubjects() ); 

    delete observer2;
    CHECK_EQUAL( 0, subject1->numObservers() );

    delete subject1;
}

TEST(ObserverTestGroup, ThirdTest)
{
    AwSubject *subject1 = new AwSubject();
    AwSubject *subject2 = new AwSubject();
    MyObserver *observer1 = new MyObserver();
    MyObserver *observer2 = new MyObserver();

    CHECK_EQUAL( 0, subject1->numObservers() );
    CHECK_EQUAL( 0, subject2->numObservers() );
    CHECK_EQUAL( 0, observer1->numSubjects() );
    CHECK_EQUAL( 0, observer2->numSubjects() );

    subject1->addObserver( observer1 );
    CHECK_EQUAL( 1, subject1->numObservers() );   
    CHECK_EQUAL( 1, observer1->numSubjects() );
    CHECK_EQUAL( 0, observer2->numSubjects() );

    subject1->addObserver( observer2 );
    CHECK_EQUAL( 2, subject1->numObservers() );
    CHECK_EQUAL( 1, observer1->numSubjects() );
    CHECK_EQUAL( 1, observer2->numSubjects() );

    subject2->addObserver( observer1 );
    CHECK_EQUAL( 2, subject1->numObservers() );
    CHECK_EQUAL( 1, subject2->numObservers() ); 
    CHECK_EQUAL( 2, observer1->numSubjects() );
    CHECK_EQUAL( 1, observer2->numSubjects() );

    delete subject1;
    CHECK_EQUAL( 1, observer1->numSubjects() );
    CHECK_EQUAL( 0, observer2->numSubjects() ); 
    CHECK_EQUAL( 1, subject2->numObservers() );

    delete observer2;
    delete observer1;
    delete subject2;
}

TEST(ObserverTestGroup, ForthTest)
{
    AwSubject *subject1 = new AwSubject();
    delete subject1;

    AwSubject subject2;
}

