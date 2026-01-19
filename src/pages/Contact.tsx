import { StaticLayout } from "@/components/layouts/StaticLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
    return (
        <StaticLayout
            title="Contact Us"
            subtitle="Have questions? We're here to help you redefine your campus experience."
        >
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="glass-card p-8 rounded-3xl border-border">
                        <h3 className="text-xl font-bold mb-6">Get in Touch</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Email</p>
                                    <p className="text-foreground/70">support@nexeralearn.edu</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Phone</p>
                                    <p className="text-foreground/70">+1 (555) 000-0000</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Office</p>
                                    <p className="text-foreground/70">Innovation Hub, Campus Square</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border-border">
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input placeholder="John Doe" className="bg-secondary/20 border-border h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input placeholder="john@example.com" className="bg-secondary/20 border-border h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Textarea placeholder="How can we help you?" className="bg-secondary/20 border-border min-h-[150px] rounded-xl resize-none" />
                        </div>
                        <Button className="w-full h-14 rounded-xl gradient-primary border-0 shadow-glow">
                            Send Message <Send className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                </div>
            </div>
        </StaticLayout>
    );
}
