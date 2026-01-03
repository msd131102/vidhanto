import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Plus, Search } from 'lucide-react';

const Documents = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Legal Documents</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Categories */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Rental Agreements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Create and customize rental agreements for residential and commercial properties.</p>
              <Button variant="outline" className="w-full">Create Now</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Legal Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Draft legal notices for various legal matters and disputes.</p>
              <Button variant="outline" className="w-full">Create Now</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Power of Attorney
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Create power of attorney documents for legal representation.</p>
              <Button variant="outline" className="w-full">Create Now</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Rental Agreement.pdf", date: "2024-01-15", status: "Completed" },
                { name: "Legal Notice.docx", date: "2024-01-12", status: "In Review" },
                { name: "Power of Attorney.pdf", date: "2024-01-10", status: "Completed" },
                { name: "Employment Contract.pdf", date: "2024-01-08", status: "Draft" }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doc.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      doc.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
