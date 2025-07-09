
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone } from "lucide-react";

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 234-567-8901', orders: 12, spent: '$1,234.56', status: 'Active' },
    { id: 2, name: 'Emily Davis', email: 'emily@example.com', phone: '+1 234-567-8902', orders: 8, spent: '$987.32', status: 'Active' },
    { id: 3, name: 'Jessica Brown', email: 'jessica@example.com', phone: '+1 234-567-8903', orders: 15, spent: '$2,156.78', status: 'VIP' },
    { id: 4, name: 'Amanda Wilson', email: 'amanda@example.com', phone: '+1 234-567-8904', orders: 3, spent: '$245.90', status: 'New' },
    { id: 5, name: 'Rachel Garcia', email: 'rachel@example.com', phone: '+1 234-567-8905', orders: 0, spent: '$0.00', status: 'Inactive' },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>Manage your customer relationships and track their activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{customer.spent}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        customer.status === 'VIP' ? 'default' :
                        customer.status === 'Active' ? 'secondary' :
                        customer.status === 'New' ? 'outline' : 'destructive'
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
