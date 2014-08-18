var algebra = "I’m assuming we all know 4-function arithmetic (+, -, *, /)\nFor integers, truncate the remainder.\ne.g. 16/5 = 3\n\nFast conversion from Binary ⇆ Octal/Hexadecimal\n\nWhen given a binary number such as \n10101000100011011010\nBreak it up into chunks of 3 or 4 for octal or hexadecimal respectively\n010 101 000 100 011 011 010 - Octal\n1010 1000 1000 1101 1010 - Hex\nThen convert each chunk to base 10 and append it. Memorize the base 2 \nnumbers up to 15 in order to be as fast as possible\n\n2504332 - Octal\nA88DA - Hex\n\nThis works for every number that is a power of another number.\n\nRemember the math order of operations!\n\nPEMDAS\nParenthesis - ()\nNo exponents\nMultiplication (*) & Division (/)\nAddition (+) & Subtraction (-)\n\nUser-Defined Classes\nConstructors\nMethods\nInstance variables\nAccess level variable modifiers\nMethod/Constructor Overloading\nMethod Overriding\n\nConstructors are called by the class name, followed by an argument list.\n\npublic class Node{\n\tObject label;\n\tNode child\n\tpublic Node(Object l, Node c){\n\t\tthis.label = l;\n\t\tthis.child = c;\n\t}\n}\n\nInstance variables are the objects of the class that the class knows. For example, a Bicycle class could have an instance variable of currentSpeed. Each Bicycle instantiated has a different current speed. In the code for the node class above, the node has instance variables label and child.\n\nJava access table for variable modifiers:\n\nModifier\nClass\tPackage\tSubclass\tWorld\npublic\tY\tY\tY\tY\nprotected\tY\tY\tY\tN\nno modifier\tY\tY\tN\tN\nprivate\tY\tN\tN\tN\n\nImportant thing to note here is that classes can access their own instance variables even if they’re private. For example:\n\npublic class Node{\n\tString label;\n\tNode child\n\tpublic Node(String l, Node c){\n\t\tthis.label = l;\n\t\tthis.child = c;\n\t}\n\tpublic String together(Node n){\n\t\treturn “”+l+n.label;\n\t}\n}\n\nVariables without modifiers are also known as package-private. \n\nOverloading occurs when there are multiple methods or constructors of the same name, but taking different arguments. Take the max function for example:\ndouble max(double a, double b)\nint max(int a, int b)\nlong max(long a, long b)\nfloat max(float a, float b)\n\nOverloaded methods or constructors do not need to have the same number of arguments. For example: \n\npublic class Rectangle {\n\tprivate int x, y;\n\tprivate int width, height;\n\n\tpublic Rectangle() {\n\t\tRectangle(0, 0);\n\t}\n\tpublic Rectangle(int width, int height) {\n\t\tRectangle(0, 0, width, height);\n\t}\n\tpublic Rectangle(int x, int y, int width, int height) {\n\t\tthis.x = x;\n\t\tthis.y = y;\n\t\tthis.width = width;\n\t\tthis.height = height;\n\t}\n\t...\n}\n\nOverridden (not overloaded!) methods are created by subclasses, which define their own methods. \ne.g)\n\npublic class A{\n\tpublic int herp(){\n\t\treturn herp(0);\n\t\n\tpublic int herp(int n){ // overloaded method\n\t\treturn (n*(n+1))/2;\n\t}\n}\n\npublic class B extends A{\n\tpublic int herp(){ //overridden method\n\t\treturn super.herp(5);\n\t}\n}\n\nThe two herp methods in class A are an example of method overloading. The herp method in class B overrides the herp method in class a, making it an example of method overriding.\n\nA couple of rules for overloading/overriding:\n\nOverriding:\nThe argument list of the overriding method must match that of the overridden method.\nThe return type of the overriding method must match that of the overridden method.\nThe access level of the overriding method cannot be more restrictive than the overridden method but can be less restrictive.\nThe overriding method must not throw new or broader checked exceptions than those declared by the overridden method.\nThe overriding method can throw narrower or fewer exceptions. \nA method marked final cannot be overridden.\nIf a method can’t be inherited, it cannot be overridden.\n\nOverloading:\n\nOverloaded methods must change the argument list.\nOverloaded methods have the option to change the return type.\nOverloaded methods have the option to change the access modifier.\nOverloaded methods can declare new or broader checked exceptions.\nA method can be overloaded in the same class or in a subclass.\n\n\nfinal local variables, static final class variables, static methods, static non-final variables\n\nConstructors and initialization of static variables, default initialization of instance variables \n\nConcepts of inheritance, abstract classes, interfaces and polymorphism\nDescription\tInterface\tAbstract\nInstance Variables\tN\tY\nFinal Instance Variables\tN\tY\nFinal Class Variables\tY\tY\nClass Variables\tN\tY\nAbstract Methods\tY\tY\nNon-Abstract Methods\tN\tY\nConstructors\tN\tY\nCan Be Instantiated\tN\tN\nExtended\tY\tY\nImplemented\tY\tN\n\nnull, this, super, super.method(args), super(args), this.var, this.method(args), this(args)\n\nThe keyword this is used to refer to the current object. It is used in constructors like so:\npublic class Node{\n\tprivate Object label;\n\tprivate Node child\n\tpublic Node(Object label, Node child){\n\t\tthis.label = label;\n\t\tthis.child = child;\n\t}\n}\nthis can be used to call a constructor when there are multiple constructors, as in the following example.\n\npublic class Rectangle {\n\tprivate int x, y;\n\tprivate int width, height;\n\n\tpublic Rectangle() {\n\t\tthis(0, 0, 0, 0);\n\t}\n\tpublic Rectangle(int width, int height) {\n\t\tthis(0, 0, width, height);\n\t}\n\tpublic Rectangle(int x, int y, int width, int height) {\n\t\tthis.x = x;\n\t\tthis.y = y;\n\t\tthis.width = width;\n\t\tthis.height = height;\n\t}\n\t...\n}\n\nConversion to supertypes and (Subtype) casts, instanceof \n\nComparison of reference types (equals(), ==, !=, Comparable.compareTo()) \n== and != only work for primitives\n.equals() works for all objects, assuming the class has overriddne the .equals() method\n\ninterface java.lang.Comparable<T>\nint compareTo(T other)\nReturn value < 0 if this is less than other.\nReturn value = 0 if this is equal to other.\nReturn value > 0 if this is greater than other.\nFor Strings, this will return the difference of the first unique chars in the two strings (this.charAt(k)-anotherString.charAt(k)). If one String ends first, the difference in length is returned (this.length() anotherString.length())."
module.exports = function(app) {
    app.all('/bible', function(req,res){
        res.render('bible/bible', {
            cookie:req.session.loggedin,
            session:req.session
        });
    });


    app.all('/bible/:section', function(req,res){
        var section = req.url
        section = section.substring(section.lastIndexOf('/')+1)
        res.render('bible/biblesection', {
            cooke:req.session.loggedin,
            session:req.session,
            section:section,
            text:algebra
        })
    });
}
