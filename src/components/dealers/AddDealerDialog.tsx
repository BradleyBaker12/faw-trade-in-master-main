import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Dealer } from '@/types';
import { createDealer } from '@/services/api';

const dealerSchema = z.object({
  name: z.string().min(2, { message: 'Dealer name is required' }),
  address: z.string().min(3, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  province: z.string().min(2, { message: 'Province is required' }),
  contactPerson: z.string().min(2, { message: 'Contact person is required' }),
  phone: z.string().min(7, { message: 'Valid phone number is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type DealerFormValues = z.infer<typeof dealerSchema>;

interface AddDealerDialogProps {
  onDealerAdded: (dealer: Dealer) => void;
}

const AddDealerDialog = ({ onDealerAdded }: AddDealerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      province: '',
      contactPerson: '',
      phone: '',
      email: '',
      status: 'Active',
    },
  });

  const onSubmit = async (values: DealerFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Since values is validated by zod, we can safely assume all required fields are present
      const dealerData: Omit<Dealer, "id" | "activeSince"> = {
        name: values.name,
        address: values.address,
        city: values.city,
        province: values.province,
        contactPerson: values.contactPerson,
        phone: values.phone,
        email: values.email,
        status: values.status,
      };
      
      const newDealer = await createDealer(dealerData);
      
      // Call the callback with the new dealer
      onDealerAdded(newDealer);
      
      toast.success('Dealer added successfully');
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to add dealer:', error);
      toast.error('Failed to add dealer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Dealer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Dealer</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new dealership to the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dealer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dealer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Dealer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDealerDialog;
